import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import API from '@aws-amplify/api';
import Storage from '@aws-amplify/storage';
import { createPoll as createPollMutation, createCandidate as createCandidateMutation } from './graphql/mutations';
import { getPoll as getPollQuery } from './graphql/queries';
import slugify from './utils/slugify';
import Button from './Button';

let counter;
let pollId;

const initialState = {
  pollType: null,
  candidate1: null,
  candidate2: null,
  pollName: null,
  isUploading: false
}

export default function CreatePoll() {
  const [state, setState] = useState(initialState);
  const history = useHistory();
  function setPollType(type) {
    setState(() => ({ ...initialState, pollType: type }))
  }

  function onChangeText(e) {
    const { name, value } = e.target
    setState(currentState => ({ ...currentState, [name]: value }))
  }
  async function onChangeImage(e) {
    if (!e.target.files[0]) return
    setState(currentState => ({ ...currentState, isUploading: true }))
    e.persist()
    const file = e.target.files[0];
    const fileName = `${uuid()}_${file.name}`;
    setState(currentState => ({
      ...currentState,
      [e.target.name]: {
        localFile: URL.createObjectURL(file),
        file,
        fileName
      }
    }))
    await Storage.put(fileName, file);
    setState(currentState => ({ ...currentState, isUploading: false }));
  }

  async function createPoll() {
    /* Check if poll name is already taken, if so append a version # to the name
    *  then create the poll.
    */
    const { pollType } = state;
    let { pollName } = state;
    try {
      pollId = slugify(pollName);
      if (counter) {
        pollId = `${pollId}-v-${counter}`;
      }
      const data = await API.graphql({
        query: getPollQuery,
        variables: {
          id: pollId
        }
      })
      if (data.data.getPoll) {
        counter ? counter = counter + 1 : counter = 2;
        return createPoll();
      }
    } catch (err) {}
    try {
      if (counter) {
        pollName = `${pollName}-v-${counter}`;
      }
      const pollData = { id: pollId, itemType: "Poll", type: pollType, name: pollName };
      const isImage = pollType === 'image';

      const candidate1Data = {
        pollCandidatesId: pollId,
        upvotes: 0,
        name: isImage ? null : candidate1,
        image: isImage ? candidate1.fileName : null
      }
      const candidate2Data = {
        pollCandidatesId: pollId,
        upvotes: 0,
        name: isImage ? null : candidate2,
        image: isImage ? candidate2.fileName : null
      }

      const createPollPromise = API.graphql({ query: createPollMutation, variables: { input: pollData } });
      const createCandidate1Promise = API.graphql({ query: createCandidateMutation, variables: { input: candidate1Data } });
      const createCandidate2Promise = API.graphql({ query: createCandidateMutation, variables: { input: candidate2Data } });
      await Promise.all([createPollPromise, createCandidate1Promise, createCandidate2Promise])

      const url = `/${pollId}`
      history.push(url)
    } catch(err) {
      console.log('error: ', err)
    }
  }

  const {
    pollType, candidate1, candidate2, pollName, isUploading
  } = state
  const isDisabled = (!pollType || !candidate1 || !candidate2 || !pollName)

  return (
    <div>
      <h1 className="
      text-3xl
      sm:text-5xl leading-8
      ">Create a new poll</h1>
      <div>
        <p  className="text-xl mt-6">What type of poll would you like to create?</p>
        <div className="flex mb-14 mt-8">
          <Button
            onClick={() => setPollType('text')}
            title="Text"
            emoji="🦄"
          />
          <Button
            onClick={() => setPollType('image')}
            title="Image"
            emoji="🐶"
            backgroundColor="#0090ff"
          />
        </div>
      </div>
      {
        pollType === 'text' && (
          <div className="mt-8">
            <p className="mb-2 font-bold">What question do you want to ask?</p>
            <input
              placeholder="Question"
              name="pollName"
              onChange={onChangeText}
              autoComplete="off"
              className="w-full text-xl px-2 py-1 outline-none border rounded text-gray-400 bg-gray-900 border-gray-800"
            />
            <p className="mb-2 mt-4 font-bold">First answer</p>
            <input
              placeholder="Answer 1"
              name="candidate1"
              onChange={onChangeText}
              autoComplete="off"
              className="w-full text-xl px-2 py-1 outline-none border rounded text-gray-400 bg-gray-800 bg-gray-900 border-gray-800"

            />
            <p className="mb-2 mt-4 font-bold">Second answer</p>
            <input
              placeholder="Answer 2"
              name="candidate2"
              onChange={onChangeText}
              autoComplete="off"
              className="w-full text-xl px-2 py-1 outline-none border rounded text-gray-400 bg-gray-900 border-gray-800"

            />
          </div>
        )
      }
      {
        pollType === 'image' && (
          <div className="mt-8">
            <p className="mb-2 font-bold">What question do you want to ask?</p>
            <input
              placeholder="Question"
              name="pollName"
              autoComplete="off"
              onChange={onChangeText}
              className="w-full text-xl px-2 py-1 outline-none border rounded text-gray-400 bg-gray-800 bg-gray-900 border-gray-800"
            />
            <div className="mt-6">
              <p className="mb-4 mt-6 font-bold">What is the first option?</p>
              {
                state.candidate1 && (
                  <img
                    src={state.candidate1.localFile}
                    style={imageStyle}
                  />
                )
              }
              <div>
                <input
                  type="file"
                  name="candidate1"
                  id="file1"
                  style={inputFileStyle}
                  onChange={onChangeImage}
                />
                <label htmlFor="file1" style={inputLabelStyle}>Choose a file</label>
              </div>
              <p className="mb-4 mt-6 font-bold">What is the second option?</p>
              {
                state.candidate2 && (
                  <img
                    src={state.candidate2.localFile}
                    style={imageStyle}
                  />
                )
              }
              <div>
                <input
                  type="file"
                  name="candidate2"
                  id="file2"
                  style={inputFileStyle}
                  onChange={onChangeImage}
                />
                <label htmlFor="file2" style={inputLabelStyle}>Choose a file</label>
              </div>
            </div>
          </div>
        )
      }
      {
        isUploading && <p className="mt-6 text-base">Please wait, file uploading...</p>
      }
      {
        pollType && (
          <div className="mt-10">
            <Button
              onClick={createPoll}
              title="Create Poll"
              emoji="🚀"
              backgroundColor="#0090ff"
              disabled={isDisabled || isUploading}
            />
          </div>
        )
      }
    </div>
  )
}

const imageStyle = {
  width: '100%',
  maxWidth: 500,
  borderRadius: 5,
  marginTop: 10,
  marginBottom: 20,
  boxShadow: '0px 0px 30px #ff00e4',
}

const inputFileStyle = {
  width: '0.1px',
  height:'0.1px',
  opacity: 0,
  overflow: 'hidden',
  position: 'absolute',
  zIndex: -1
}

const inputLabelStyle = {
  fontSize: '1.25em',
  backgroundColor: '#ff00e4',
  fontWeight: 700,
  padding: '8px 18px',
  color: 'white',
  display: 'inlineBlock',
  cursor: 'pointer'
}