import React, { useState, useEffect, useRef } from 'react';

import Geolocation from 'react-geolocation';
import CircularProgressbar from 'react-circular-progressbar';
import SunCalc from 'suncalc';
import moment from 'moment';

import './App.css';

const useInterval = (callback, delay) => {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    if (delay !== null) {
      let id = setInterval(savedCallback.current, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const calcPercentage = (hoursLeft, hoursBetweenTotal) => {
  if (hoursLeft > hoursBetweenTotal) {hoursLeft = hoursBetweenTotal};
  return (hoursLeft/ hoursBetweenTotal) * 100;
}

const diffBetween = (start, end) => {
  const endTime = moment(end);
  return moment.duration(endTime.diff(start));
}
const parseTimeInt = (number) => {
  if (number < 0) {number = 0}

  return number
    .toString()
    .padStart(2, "0");
}

const renderCountdown = (diff) => {
  const hours = parseTimeInt(diff.hours());
  const minutes = parseTimeInt(diff.minutes());
  const seconds = parseTimeInt(diff.seconds());

  return `${hours}:${minutes}:${seconds}`
}

const DayWatch = ({coords: {latitude, longitude}}) => {
  // Increment our timer
  let [currentTime, setCurrentTime] = useState(new Date());
  useInterval(() => {
    setCurrentTime(new Date());
  }, 100);

  // Calculate the time to sunset
  const {sunrise, sunset} =  SunCalc.getTimes(currentTime, latitude, longitude)
  const diffBetweenTotal = diffBetween(sunrise, sunset);
  const diffLeft = diffBetween(currentTime, sunset);

  // Calculate the time of sunlight used today
  const percentage = calcPercentage(diffLeft, diffBetweenTotal)

  return (
    <div className="progress">
      <CircularProgressbar
        percentage={percentage}
        text={renderCountdown(diffLeft)}
      />
      <h3>(Above is the amount of ☀️ left in your day)</h3>
    </div>
  )
}

const Loading = () => <div>LOADING</div>

const App = () => (
  <div className="App">
    <h1 className="header">Your life is finite, <br/> spend it in the sunlight.</h1>
    <Geolocation
      render={(props) => {
        const {fetchingPosition, position, getCurrentPosition} = props
        console.log(props)
        return (
        fetchingPosition
          ? <Loading onClick={getCurrentPosition}/>
          : <DayWatch coords={position.coords} />)
    }}
    />
  </div>
);
export default App;