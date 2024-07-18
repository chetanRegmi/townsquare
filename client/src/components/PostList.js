import React, { useState } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  List,
  ListItemText,
  CircularProgress,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import { GET_POSTS, UPDATE_POST_ORDER, POST_UPDATED_SUBSCRIPTION } from '../graphql/queries';

// Number of posts to fetch per page
const POSTS_PER_PAGE = 20;

/**
 * PostList Component
 * 
 * This component displays a list of posts that can be reordered using drag and drop.
 * It uses Apollo Client for GraphQL operations and react-beautiful-dnd for drag and drop functionality.
 */
const PostList = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  // Fetch posts using Apollo useQuery hook
  const { loading, error, data, fetchMore } = useQuery(GET_POSTS, {
    variables: { offset: 0, limit: POSTS_PER_PAGE }
  });

  // Mutation to update post order
  const [updatePostOrder] = useMutation(UPDATE_POST_ORDER);

  // Subscription to listen for post updates
  useSubscription(POST_UPDATED_SUBSCRIPTION, {
    onSubscriptionData: ({ client, subscriptionData }) => {
      const updatedPost = subscriptionData.data.postUpdated;
      const existingPosts = client.readQuery({ 
        query: GET_POSTS,
        variables: { offset: 0, limit: POSTS_PER_PAGE }
      });
      if (existingPosts) {
        // Update the local cache with the updated post
        const newPosts = existingPosts.posts.map(post => 
          post.id === updatedPost.id ? updatedPost : post
        );
        client.writeQuery({
          query: GET_POSTS,
          variables: { offset: 0, limit: POSTS_PER_PAGE },
          data: { posts: newPosts }
        });
      }
    }
  });

  /**
   * Handle the end of a drag operation
   * @param {Object} result - The result of the drag operation
   */
  const onDragEnd = async (result) => {
    if (!result.destination) return;
    setIsUpdating(true);
    setUpdateError(null);

    const items = Array.from(data.posts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    try {
      await updatePostOrder({
        variables: {
          postId: reorderedItem.id,
          newOrder: result.destination.index
        },
        optimisticResponse: {
          __typename: 'Mutation',
          updatePostOrder: {
            __typename: 'Post',
            id: reorderedItem.id,
            title: reorderedItem.title,
            postOrder: result.destination.index
          }
        },
        update: (cache) => {
          // Update the local cache with the new order
          const existingPosts = cache.readQuery({ 
            query: GET_POSTS,
            variables: { offset: 0, limit: POSTS_PER_PAGE }
          });
          if (existingPosts) {
            const newPosts = items.map((post, index) => ({ ...post, postOrder: index }));
            cache.writeQuery({
              query: GET_POSTS,
              variables: { offset: 0, limit: POSTS_PER_PAGE },
              data: { posts: newPosts }
            });
          }
        }
      });
    } catch (error) {
      console.error('Error updating post order:', error);
      if (error.graphQLErrors) {
        console.error('GraphQL errors:', error.graphQLErrors);
      }
      if (error.networkError) {
        console.error('Network error:', error.networkError);
      }
      setUpdateError('Failed to update post order. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Load more posts when the "Load More" button is clicked
   */
  const loadMore = () => {
    fetchMore({
      variables: {
        offset: data.posts.length,
        limit: POSTS_PER_PAGE
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          posts: [...prev.posts, ...fetchMoreResult.posts]
        });
      }
    });
  };

  // Show loading spinner while data is being fetched
  if (loading && !data) return <CircularProgress />;
  // Show error message if there's an error
  if (error) return <Typography color="error">Error: {error.message}</Typography>;

  return (
    <Box>
      {updateError && <Typography color="error">{updateError}</Typography>}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="posts" isDropDisabled={isUpdating}>
          {(provided) => (
            <List {...provided.droppableProps} ref={provided.innerRef}>
              {data.posts.map((post, index) => (
                <Draggable key={post.id} draggableId={post.id} index={index} isDragDisabled={isUpdating}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        marginBottom: 8,
                        backgroundColor: snapshot.isDragging ? 'lightgreen' : 'white',
                        opacity: isUpdating ? 0.5 : 1,
                        ...provided.draggableProps.style
                      }}
                    >
                      <Card style={{ width: '100%' }}>
                        <CardContent>
                          <ListItemText 
                            primary={post.title} 
                            secondary={`Order: ${post.postOrder}`} 
                          />
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>
      {isUpdating && <CircularProgress />}
      {/* Show "Load More" button if there might be more posts */}
      {data.posts.length % POSTS_PER_PAGE === 0 && (
        <Box mt={2} textAlign="center">
          <Button variant="contained" onClick={loadMore} disabled={isUpdating}>
            Load More
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default PostList;