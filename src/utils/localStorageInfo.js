import { v4 as uuid } from 'uuid'
export const CLIENT_ID = `THIS_OR_THAT_CLIENT_KEY_${uuid()}`;
export const BASE_KEY = 'THIS_OR_THAT_CLIENT_KEY';
export const STORAGE_KEY = "THIS_OR_THAT_2020";

/* Using setVoteForPoll we are limiting each user to vote only 50 times per choice */

export function setVoteForPoll(pollId, candidateId) {
  let limitReached = false;
  let voteData = localStorage.getItem(STORAGE_KEY);
  voteData = JSON.parse(voteData);
  if (!voteData) {
    const voteData = {
      [pollId]: {
        [candidateId]: {
          upvotes: 1
        }
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(voteData))
  } else {
    if (voteData[pollId]) {
       if (voteData[pollId][candidateId]) {
         if (voteData[pollId][candidateId].upvotes === 50) {
           limitReached = true
         } else {
           voteData[pollId][candidateId].upvotes = voteData[pollId][candidateId].upvotes + 1
         }
       } else {
        voteData[pollId][candidateId] = {
          upvotes: 1
        }
       }
    } else {
      voteData[pollId] = {}
      voteData[pollId][candidateId] = {
        upvotes: 1
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(voteData))
  }
  return limitReached
}

