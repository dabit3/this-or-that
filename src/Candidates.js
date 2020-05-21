import React from 'react';
import { Link } from 'react-router-dom';
import { STORAGE_KEY } from './utils/localStorageInfo';
import votePink from './assets/votepink.png';
import voteBlue from './assets/voteblue.png';
import Button from './Button';
import { toast, ToastContainer } from 'react-toastify';

export default function Candidates({ poll, candidates, onUpVote, simulateUpvotes, pollView = false }) {
  const isImage = poll.type === 'image';
  let totalUpvotes;
  let candidate1;
  let candidate2;
  if (pollView) {
    /* If this is poll view, create percentages for chart */
    totalUpvotes = candidates.reduce((acc, next) => acc + next.upvotes, 0);
    candidate1 = candidates[0].upvotes ? (candidates[0].upvotes / totalUpvotes) * 100 : 0;
    candidate2 = candidates[1].upvotes ? (candidates[1].upvotes / totalUpvotes) * 100 : 0;
  }
  if (totalUpvotes === 0) {
    /* If poll is new, set 50% width for each side of chart */
    candidate1 = 50;
    candidate2 = 50;
  }

  const voteDataFromStorage = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (voteDataFromStorage && voteDataFromStorage[poll.id]) {
    /* If user has voted 50 times for a candidate, disable voting */
    const c1 = voteDataFromStorage[poll.id][candidates[0].id];
    const c2 = voteDataFromStorage[poll.id][candidates[1].id];
    if (c1 && (c1.upvotes >= 50)) candidates[0].isDisabled = true;
    if (c2 && (c2.upvotes >= 50)) candidates[1].isDisabled = true;
  }

  return (
    <div>
      {
        /* This is the data vizualization. Essentially a rectangle filled with the percentage width of each candidate. */
        pollView && (
          <div style={dataVizStyle}>
            <div style={candidate1Style(candidate1)} />
            <div style={candidate2Style(candidate2)} />
          </div>
        )
      }
      <div className={`flex ${isImage ? 'flex-col mt-6' : 'flex-col md:flex-row mt-4'}`}>
        {
          candidates.map((candidate, index) => {
            if (poll.type === 'text') {
              return (
                <div className="mt-4 flex items-center" key={candidate.id}>
                  <div className="flex mr-4">
                    <p className="capitalize text-2xl sm:text-4xl font-bold">{candidate.name}</p>
                  </div>
                  <div className="flex items-center">
                    <div style={voteImageContainerStyle(index, candidate.isDisabled)} className="w-12 md:w-18">
                      <img
                        onClick={candidate.isDisabled ? null : () => onUpVote(candidate, poll)}
                        src={index == Number(0) ? votePink : voteBlue}
                      />
                    </div>
                    <p className="
                    w-20
                    text-4xl font-bold ml-3" style={voteNameStyle(index)}>{candidate.upvotes}</p>
                  </div>
                </div>
              )
            }
            return (
              <div className="flex items-center" key={candidate.id}>
                <div className={`flex relative ${index === Number(0) ? 'mb-4' : 'mb-0'}`}>
                  <Link style={linkStyle(pollView)} to={`/${poll.id}`}>
                    <img
                      src={candidate.image}
                      style={candidateImageStyle(index)}
                      className="
                      sm:min-w-80
                      w-full
                      xs1:w-112
                      xs2:w-100
                      xs3:w-88 xs3:h-72
                      sm:w-full
                      sm:h-64
                      lg:max-w-2xl
                      min-w-60
                      min-h-60
                      "
                    />
                  </Link>
                  <div className="
                    block sm:hidden
                    ml-2
                    absolute
                    bottom-0 left-0 mb-2
                  ">
                    <ImageVoteBlock
                      poll={poll}
                      onUpVote={onUpVote}
                      candidate={candidate}
                      index={index}
                    />
                  </div>
                </div>
                <div className="hidden sm:block">
                  <ImageVoteBlock
                    poll={poll}
                    onUpVote={onUpVote}
                    candidate={candidate}
                    index={index}
                  />
                </div>
              </div>
            )
          })
        }
      </div>
      {
        pollView && (
          <div className="mt-6">
            <Button
              emoji="🌍"
              title="Share"
              onClick={
                () => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                  toast("Successfully copied to clipboard!", {
                    className: 'toast-background',
                  });
                }
              }
            />
            <ToastContainer />
          </div>
        )
      }
    </div>
  )
}

function ImageVoteBlock({
  index, candidate, poll, onUpVote
}) {
  return (
    <div className="
    flex items-center
    ml-0 sm:ml-4
    ">
      <div style={voteImageContainerStyle(index, candidate.isDisabled)} className="w-12 md:w-18">
        <img
          onClick={() => onUpVote(candidate, poll)}
          src={index == Number(0) ? votePink : voteBlue}
        />
      </div>
      <p className="w-24 ml-3 text-4xl font-bold" style={voteNameStyle(index)}>{candidate.upvotes}</p>
    </div>
  )
}

const dataVizStyle = {
  width: '100%',
  height: 60,
  display: 'flex',
  marginTop: 10,
  borderRadius: 10
}

function linkStyle(pollView) {
  return {
    pointerEvents: pollView ? 'none' : 'auto',
  }
}

function candidate1Style(width) {
  return {
    backgroundColor: '#ff00e4',
    width: `${width}%`,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    transition: 'all 0.5s ease'
  }
}

function candidate2Style(width) {
  return {
    backgroundColor: '#0090ff',
    width: `${width}%`,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    transition: 'all 0.5s ease'
  }
}

const voteImageContainerStyle = (index, isDisabled) => ({
  backgroundColor: index === Number(0) ? "#ff00e4" : "#0090ff",
  boxShadow: 'rgba(0, 0, 0, 0.25) 0px 0.125rem 0.25rem',
  borderRadius: 9999,
  opacity: isDisabled ? .5 : 1,
  cursor: isDisabled ? 'auto': 'pointer',
  bottom: 4
});

function candidateImageStyle(index) {
  const indexzero = index === Number(0)
  return {
    border: `1px solid ${indexzero ? "#ff00e4" : "#0090ff"}`,
    objectFit: 'contain',
  }
}

function voteNameStyle(index) {
  const indexzero = index === Number(0)
  return {
    color: indexzero ? "#ff00e4" : "#0090ff",
  }
}
