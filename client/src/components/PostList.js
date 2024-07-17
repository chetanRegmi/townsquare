import React from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import { GET_POSTS, UPDATE_POST_ORDER, POST_UPDATED_SUBSCRIPTION } from '../graphql/queries';

const POSTS_PER_PAGE = 20;

const PostList = () => {
  const { loading, error, data, fetchMore } = useQuery(GET_POSTS, {
    variables: { offset: 0, limit: POSTS_PER_PAGE }
  });
  const [updatePostOrder] = useMutation(UPDATE_POST_ORDER);

  useSubscription(POST_UPDATED_SUBSCRIPTION, {
    onSubscriptionData: ({ client, subscriptionData }) => {
      const updatedPost = subscriptionData.data.postUpdated;
      const existingPosts = client.readQuery({ 
        query: GET_POSTS,
        variables: { offset: 0, limit: POSTS_PER_PAGE }
      });
      if (existingPosts) {
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

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(data.posts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updatePostOrder({
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
          order: result.destination.index
        }
      },
      update: (cache) => {
        const existingPosts = cache.readQuery({ 
          query: GET_POSTS,
          variables: { offset: 0, limit: POSTS_PER_PAGE }
        });
        if (existingPosts) {
          const newPosts = items.map((post, index) => ({ ...post, order: index }));
          cache.writeQuery({
            query: GET_POSTS,
            variables: { offset: 0, limit: POSTS_PER_PAGE },
            data: { posts: newPosts }
          });
        }
      }
    });
  };

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

  if (loading && !data) return <CircularProgress />;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;

  return (
    <Box>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="posts">
          {(provided) => (
            <List {...provided.droppableProps} ref={provided.innerRef}>
              {data.posts.map((post, index) => (
                <Draggable key={post.id} draggableId={post.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        marginBottom: 8,
                        backgroundColor: snapshot.isDragging ? 'lightgreen' : 'white',
                        ...provided.draggableProps.style
                      }}
                    >
                      <Card style={{ width: '100%' }}>
                        <CardContent>
                          <ListItemText 
                            primary={post.title} 
                            secondary={`Order: ${post.order}`} 
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
      {data.posts.length % POSTS_PER_PAGE === 0 && (
        <Box mt={2} textAlign="center">
          <Button variant="contained" onClick={loadMore}>
            Load More
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default PostList;
