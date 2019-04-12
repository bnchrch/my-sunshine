import React, { useState, useEffect, useRef } from 'react';

import Geolocation from 'react-geolocation';
import CircularProgressbar from 'react-circular-progressbar';
import SunCalc from 'suncalc';
import moment from 'moment';
import get from 'lodash/fp/get';

import './App.css';

/**
 * Call a given function every delay period.
 * @param {Function} callback - The function to call on every interval
 * @param {Number} delay - The interval to set
 */
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

/**
 * Calculate the percentage of day light that has passed
 * @param {Number} hoursLeft - hours until sunset
 * @param {Number} hoursBetweenTotal - hours between sunset and sunrise
 */
const calcPercentage = (hoursLeft, hoursBetweenTotal) => {
  if (hoursLeft > hoursBetweenTotal) {hoursLeft = hoursBetweenTotal};
  return (hoursLeft/ hoursBetweenTotal) * 100;
}

/**
 * Get the diff between two dates
 * @param {Date} start - start time
 * @param {Date} end - end time
 */
const diffBetween = (start, end) => {
  const endTime = moment(end);
  return moment.duration(endTime.diff(start));
}

/**
 * Formats a number so that it
 * 1. Cannot be < 0
 * 2. Has a trailing 0 if only one digit
 * @param {Number} number - the number to format
 */
const parseTimeInt = (number) => {
  if (number < 0) {number = 0}

  return number
    .toString()
    .padStart(2, "0");
}

/**
 * Render the text for the countdown
 * @param {Object} diff - Moment diff
 */
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
    <React.Fragment>
      <CircularProgressbar
        percentage={percentage}
        text={renderCountdown(diffLeft)}
      />
      <h3>(Above is the amount of  ☀️ left in your day)</h3>
    </React.Fragment>
  )
}

const Loading = ({loading}) => <h3 className={!loading && "fade-out"}>loading...</h3>

const App = () => (
  <div className="App">
    <h1 className="header">Your life is finite, <br/> spend it in the sunlight.</h1>
    <Geolocation
      render={({fetchingPosition, position}) => {
        const coords = get('coords', position)
        return (
          <React.Fragment>
            <Loading loading={fetchingPosition}/>
            <div className={coords ? "progress" : "progress loading"}>
              {
                coords && <DayWatch coords={coords} />
              }
            </div>
          </React.Fragment>)}
      }
    />
  </div>
);


export default App;