import React from 'react';
import { Link, useHistory, useLocation } from "react-router-dom";
import logo from './assets/logo.png';
import Button from './Button';

export default function Header() {
  const history = useHistory();
  let { pathname } = useLocation();
  function createPoll() {
    history.push("/create");
  }
  console.log('pathName:', pathname)
  return (
    <div className="
    w-full lg:w-main
    py-8
    md:py-16
    px-4 md:px-8 lg:px-0
    ">
        <div className="flex flex-col md:flex-row">
          <div className="flex">
            <Link to="/">
              <img className="md:h-16 h-12" src={logo} />
            </Link>
            <Link to="/">
              <h1
                style={headerStyle}
                className="
                  font-main text-4xl
                  md:text-5xl font-bold ml-4
                "><span style={{ color: "#0090ff"}}>This</span> or <span style={{ color: "#ff00e4"}}>That</span></h1>
            </Link>
          </div>
          {
            pathname !== '/create' && (
              <div className="
                pt-4
                md:pt-0
                flex flex-1 md:justify-end w-full sm:w-auto
              ">
                <Button
                  onClick={createPoll}
                  title="Create New Poll"
                  emoji="🌈"
                />
              </div>
            )
          }
        </div>
    </div>
  )
}


const headerStyle = {
  textShadow: 'rgba(0, 0, 0, 0.25) 0px 0.1rem 0.1rem',
}