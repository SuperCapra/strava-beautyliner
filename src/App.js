import './App.css';
import React from 'react';
import utils from './utils.js'
import Loader from './Loader.js'
import ImageComponent from './ImageComponent.js'

const stravaAuthorizeUrl = process.env.REACT_APP_STRAVA_HOST + process.env.REACT_APP_STRAVA_AUTORIZE_DIRECTORY + 
  '?client_id=' + process.env.REACT_APP_STRAVA_CLIENT_ID + 
  '&redirect_uri=' + process.env.REACT_APP_REDIRECT_URI + 
  '/&response_type=code&scope=activity:read_all'

let unitMeasure = 'metric'
let called = false 
let athleteData = {}
let activities = []
let activity = {}
let accessToken
let isLoading = false
let stage = 'RequestedLogin'
let stageHistory = ['ShowingActivity']
let stages = ['RequestedLogin','FetchingActivities','ShowingActivities','FetchingActivity','PersonalizingPhoto','ShowingActivity']

function App() {
  return (
    <Homepage />
  );
}

class Homepage extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      stage : stage,
      stageHistory : stageHistory,
    }
  }

  changeStage(value) {
    if(value.stage) {
      stage = value.stage
      if(value.stage === stages[0]) {
        stageHistory = [stages[0]]
      } else if(stageHistory[stageHistory.length - 1] !== value.stage) {
        stageHistory.push(value.stage)
      }
    }
    this.setState({
      stage : stage,
      stageHistory : stageHistory
    })
  }

  routesToStage() {
    isLoading = false
    let queryParameters = new URLSearchParams(window.location.search)
    let code = queryParameters.get('code')
    if(code && !called) {
      called = true
      this.getAccessTokenAndActivities(code)
    }
    if(isLoading || this.state.stage === 'FetchingActivities') {
      return (
        <Loader/>
      )
    } else {
      if(this.state.stage === 'RequestedLogin') {
        return (
          <div className="button-login justify-center-column" onClick={() => {
            window.location.href = stravaAuthorizeUrl
          }}><p className="p-login">LOGIN TO STRAVA</p></div>
        )
      } else if(this.state.stage === 'ShowingActivities') {
        let activitiesButton = activities.map(element => 
          <div key={element.id} className="button-activity justify-center-column" onClick={() => this.getActivity(element.id)}>
            <p className="title-activity">{element.name}</p>
            <p className="subtitle-activity">{element.subtitle}</p>
          </div>)
        return (
          activitiesButton
        )
      } else if(this.state.stage === 'ShowingActivity') {
        return (
          <div>
              <ImageComponent activity={activity}/>
          </div>
        )
      }
    }
  }

  getAccessTokenAndActivities(userCode) {
    isLoading = true
    console.log('getting the access token...')
    let urlAccessToken = process.env.REACT_APP_STRAVA_HOST + process.env.REACT_APP_TOKEN_DIRECTORY +
      '?client_id=' + process.env.REACT_APP_STRAVA_CLIENT_ID + 
      '&client_secret=' + process.env.REACT_APP_STRAVA_CLIENT_SECRET + 
      '&code=' + userCode +
      '&grant_type=authorization_code'
  
    fetch(urlAccessToken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Length': '0'
      },
    }).then(response => response.json())
      .then(res => {
        console.log('res: ', res)
        if(res && res.errors && res.errors.length) {
          window.history.pushState({}, document.title, window.location.pathname);
          window.location.reload();
        }
        accessToken = res.access_token
        athleteData = res.athlete
        console.log('athleteData: ', athleteData)
        //TODO apparently the data are returned only in meters so we need to convert it
        if(accessToken) this.getActivities()
        // if(accessToken) this.getAthleDataComplete()
      })
      .catch(e => console.log('Fatal Error: ', JSON.parse(JSON.stringify(e))))
  }

  getAthleDataComplete() {
    console.log('getting all the athlete data...')
    let urlAthleteData = process.env.REACT_APP_STRAVA_HOST + process.env.REACT_APP_ATHLETE_DIRECTORY +
    '?access_token=' + accessToken

    fetch(urlAthleteData, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Length': '0'
      },
    }).then(response => response.json())
      .then(res => {
        console.log('res: ', res)
        if(res) {
          console.log('Athlete data: ', res)
          unitMeasure = !res.measurement_preference || res.measurement_preference === 'meters' ? 'meter' : 'imperial'
          this.getActivities()
        }
      })
      .catch(e => console.log('Fatal Error: ', e))
  }
  
  getActivities() {
    console.log('getting all the activities...')
    let urlActivities = process.env.REACT_APP_STRAVA_HOST + process.env.REACT_APP_ACTIVITY_DIRECTORY +
      '?access_token=' + accessToken
  
    fetch(urlActivities, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Length': '0'
      },
    }).then(response => response.json())
      .then(res => {
        console.log('res: ', res)
        if(res) {
          res.forEach(e => {
            console.log('Activity: ', e)
            let t = {
              average: utils.getAverageSpeedMetric(e.distance, e.moving_time),
              metric: {
                beautyAverage: utils.getAverageSpeedMetric(e.distance, e.moving_time) + 'km/h',
                beautyElevation: e.total_elevation_gain + 'm',
                beautyDistance: (e.distance / 1000).toFixed(2) + 'km',
                distance: Number((e.distance / 1000).toFixed(2)),
              },
              imperial: {
                beautyAverage: utils.getAverageSpeedImperial(e.distance, e.moving_time) + 'mi/h',
                beautyElevation: (e.total_elevation_gain * 3.28084).toFixed(0) + 'ft',
                beautyDistance: (e.distance / 1000).toFixed(2) + 'mi',
                distance: Number(((e.distance / 1000) * 0.621371).toFixed(2)),
              },
              beautyCoordinates: undefined,
              beautyEndCoordinates: undefined,
              beautyDuration: utils.getBeautyDuration(e.moving_time),
              beautyName: utils.removeEmoji(e.name),
              beautyPower: e.average_watts + 'W',
              beautyDate: utils.getBeautyDatetime(e.start_date_local),
              durationMoving: e.moving_time,
              durationElapsed: e.elapsed_time,
              endLatitude: e.end_latlng && e.end_latlng.length && e.end_latlng.length === 2 ? e.end_latlng[0] : undefined,
              endLongitude: e.end_latlng && e.end_latlng.length && e.end_latlng.length === 2 ? e.end_latlng[1] : undefined,
              distance: e.distance,
              elevation: e.total_elevation_gain,
              id: e.id,
              locationCountry: e.location_country,
              movingTime: e.moving_time,
              name: e.name,
              power: e.average_watts,
              photoUrl: undefined,
              sportType: utils.labelize(e.sport_type),
              startDate: e.start_date,
              startDateLocal: e.start_date_local,
              startLatitude: e.start_latlng && e.start_latlng.length && e.start_latlng.length === 2 ? e.start_latlng[0] : undefined,
              startLongitude: e.start_latlng && e.start_latlng.length && e.start_latlng.length === 2 ? e.start_latlng[1] : undefined,
              unitMeasure: unitMeasure
            }
            t.beautyCoordinatesComplete = utils.getBeautyCoordinates([t.startLatitude, t.startLongitude])
            t.beautyCoordinates = t.beautyCoordinatesComplete.beautyCoordinatesTextTime
            t.beautyEndCoordinatesComplete = utils.getBeautyCoordinates([t.endLatitude, t.endLongitude])
            t.beautyEndCoordinates = t.beautyEndCoordinatesComplete.beautyCoordinatesTextTime
            t.metric.subtitle = t.beautyDate + ' | ' + t.sportType + ' | ' + t.metric.distance + ' | ' + t.beautyDuration
            t.metric.beautyData = t.metric.beautyDistance + ' x ' + t.metric.beautyElevation + ' x ' + t.beautyDuration
            t.imperial.subtitle = t.beautyDate + ' | ' + t.sportType + ' | ' + t.imperial.distance + ' | ' + t.beautyDuration
            t.imperial.beautyData = t.imperial.beautyDistance + ' x ' + t.imperial.beautyElevation + ' x ' + t.beautyDuration
            activities.push(t)
          })
        }
      })
      .catch(e => console.log('Fatal Error: ', e))
      .finally(() => {
        isLoading = false
        this.changeStage({stage:'ShowingActivities'})
        console.log('activities: ', activities)
      })
  }

  // deauthorize(code) {
  //   let urlDeauthorize = process.env.REACT_APP_STRAVA_HOST + process.env.REACT_APP_DEAUTHORIZE_DIRECTORY +
  //   '?access_token=' + code

  //   fetch(urlDeauthorize, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Accept': '*/*',
  //       'Accept-Encoding': 'gzip, deflate, br',
  //       'Content-Length': '0'
  //     },
  //   }).then(response => response.json())
  //     .then(res => {
  //       console.log('res', res)
  //     })
  //     .catch(e => console.log('Fatal Error: ', e))
  // }

  getActivity(activityId) {
    isLoading = false
    this.changeStage({stage:'FetchingActivity'})
    console.log('getting activityId: ', activityId)
    let urlActivities = process.env.REACT_APP_STRAVA_HOST + process.env.REACT_APP_ACTIVITY_DIRECTORY + 
      '/' + activityId +
      '?access_token=' + accessToken
  
    fetch(urlActivities, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Length': '0'
      },
    }).then(response => response.json())
      .then(res => {
        console.log('res: ', res)
        if(res) {
          let indexActivity = activities.findIndex(x => x.id === activityId)
          activities[indexActivity].coordinates = utils.polylineToGeoJSON(res.map.polyline)
          activities[indexActivity].polyline = res.map.polyline
          activity = activities[indexActivity]
          activity.photoUrl = res?.photos?.primary?.urls['600']
          console.log(activity)
          // this.getImage(activity.photoUrl)
        }
      })
      .catch(e => console.log('Fatal Error: ', JSON.parse(JSON.stringify(e))))
      .finally(() => {
        isLoading = false
        // this is needed otherwise everytime goes in 403 beacuse i do not have enought user licences
        // this.deauthorize(accessToken)
        this.changeStage({stage:'ShowingActivity'})
        console.log('activity: ', activity)
      })
  }


  render() {
    return (   
      <div className="App">
          {/* {this.returnRadioLang()}
          {this.returnBack()} */}
        <div className="App-header">
            {this.routesToStage()}
        </div>
      </div>
    )
  }
}

export default App;
