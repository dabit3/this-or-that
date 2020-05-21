import React, { useEffect, useReducer } from 'react';
import API from '@aws-amplify/api';
import Storage from '@aws-amplify/storage';
import { Link } from 'react-router-dom';
import { itemsByType } from './gql/queries';
import { onUpdateByID } from './gql/subscriptions';
import { upVote } from './gql/mutations';
import { setVoteForPoll, CLIENT_ID } from './utils/localStorageInfo';
import Candidates from './Candidates';
import actionTypes from './actionTypes';

const initialState = {
  polls: [],
  loading: true,
}

function reducer(state, action) {
  switch(action.type) {
    case actionTypes.SET_POLL:
      return {
        ...state, polls: action.polls, loading: false
      }
    case actionTypes.UPVOTE:
      const { pollId, candidateId } = action
      const polls = state.polls
      const poll = polls.find(p => p.id === pollId)
      const pollIndex = polls.findIndex(p => p.id === pollId)
      const identifiedCandidate = poll.candidates.items.find(c => c.id === candidateId)
      const candidateIndex = poll.candidates.items.findIndex(c => c.id === candidateId)
      identifiedCandidate.upvotes = identifiedCandidate.upvotes + 1
      polls[pollIndex].candidates.items[candidateIndex] = identifiedCandidate
      return {
        ...state, polls
      }
    default:
      return state
  }
}

export default function Polls() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const subscriptions = {}
  useEffect(() => {
    fetchPolls();
    return () => {
      Object.values(subscriptions).forEach(subscription => subscription.unsubscribe())
    }
  }, []);
  async function fetchPolls() {
    const pollData = await API.graphql({
      query: itemsByType,
      variables: {
        sortDirection: "ASC",
        itemType: "Poll",
        limit: 5
      }
    })
    await Promise.all(pollData.data.itemsByType.items.map(async poll => {
      await Promise.all(poll.candidates.items.map(async c => {
        const image = await Storage.get(c.image)
        c.image = image
        return image
      }))
    }))
    dispatch({ type: actionTypes.SET_POLL, polls: pollData.data.itemsByType.items })
    pollData.data.itemsByType.items.forEach(item => subscribe(item))
  }

  function subscribe(pollData) {
    const { items } = pollData.candidates
    const { id: pollId } = pollData
    const id1 = items[0].id
    const id2 = items[1].id

    subscriptions[id1] = API.graphql({
      query: onUpdateByID,
      variables: { id: id1 }
    })
    .subscribe({
      next: apiData => {
        const { value: { data: { onUpdateByID: { id, clientId }}} } = apiData
        if (clientId === CLIENT_ID) return
        dispatch({ type: actionTypes.UPVOTE, pollId, candidateId: id })
      }
    })

    subscriptions[id2] = API.graphql({
      query: onUpdateByID,
      variables: { id: id2 }
    })
    .subscribe({
      next: apiData => {
        const { value: { data: { onUpdateByID: { id, clientId }}} } = apiData
        if (clientId === CLIENT_ID) return
        dispatch({ type: actionTypes.UPVOTE, pollId, candidateId: id })
      }
    })
  }

  function createLocalUpvote(candidateId, pollId) {
    const limitReached = setVoteForPoll(pollId, candidateId);
    if (limitReached) return;
    const polls = state.polls;
    const poll = polls.find(p => p.id === pollId);
    const pollIndex = polls.findIndex(p => p.id === pollId);
    const identifiedCandidate = poll.candidates.items.find(c => c.id === candidateId);
    const candidateIndex = poll.candidates.items.findIndex(c => c.id === candidateId);
    identifiedCandidate.upvotes = identifiedCandidate.upvotes + 1;
    polls[pollIndex].candidates.items[candidateIndex] = identifiedCandidate;
    dispatch({ type: actionTypes.SET_POLL, polls });
  }
  async function onUpVote({ id: candidateId }, { id: pollId }) {
    createLocalUpvote(candidateId, pollId);
    upvoteApi(candidateId);
  }
  async function upvoteApi(id) {
    await API.graphql({
      query: upVote,
      variables: { id, clientId: CLIENT_ID }
    })
  }
  if (state.loading) return <h2>Loading...</h2>
  return (
    <div>
      {
        state.polls.map((poll, index) => (
          <div className="
          bg-almostBlack
          rounded px-4 sm:px-6 py-4 border border-gray-800 mb-4" key={poll.id}>
            <Link to={`/${poll.id}`}>
              <h3 className="
              leading-tight
              sm:leading-normal
              transition-all text-3xl hover:text-mainPink
              sm:text-4xl
              mb-3
              font-light
              ">{poll.name}</h3>
            </Link>
            <Candidates
              key={index}
              candidates={poll.candidates.items}
              poll={poll}
              onUpVote={onUpVote}
            />
          </div>
        ))
      }
    </div>
  )
}


/* Code I might need later */

// function simulate() {
//   state.polls.forEach(poll => {
//     poll.candidates.items.forEach(candidate => simulateUpvotes(candidate, poll))
//   })
// }

// function simulateUpvotes(candidate, poll) {
//   let i = 0;
//   setInterval(() => {
//     i = i + 1
//     if (i > 2000) return
//     onUpVote(candidate, poll)
//   })
// }