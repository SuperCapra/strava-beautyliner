import logo from './logo.svg';
import './App.css';
import React from 'react';
const clientId = process.env.REACT_APP_STRAVA_CLIENT_ID

function App() {
  return (
    <Homepage/>
  );
}

class Homepage extends React.Component{
  // constructor(props) {
  //   super(props);
  //   // this.state = {
  //   //   stage : stage,
  //   //   stageHistory : stageHistory
  //   // }
  // }
  
  // routesToStravaLogin() {
  //   if(!Boolean(active)) {
  //     return (
  //       <code className="code-inactive">{message}</code>
  //     )
  //   }
  //   if(this.state.stage === 'LanguageSelection') {
  //     return (<LanguageSelection onClick={value => this.changeStage(value)}/>)
  //   } else if(this.state.stage === 'FirstStep') {
  //     return (<FirstStep onInteractiveSelection={value => this.changeStage(value)}/>)
  //   } else if(this.state.stage === 'Interactive') return (
  //     <Interactive/>
  //   )
  // }

  // returnRadioLang() {
  //   if(language) return (
  //     <RadioLang className="radio-lang" onChangeLanguage={value => this.changeStage(value)} onBack={() => this.goBack()}/>
  //   )
  //   return (<div></div>)
  // }

  // goBack() {
  //   console.log('stageHistory', stageHistory)
  //   stageHistory.pop()
  //   this.changeStage({stage: stageHistory[stageHistory.length - 1]})
  //   console.log('stageHistory', stageHistory)
  // }

  // returnBack() {
  //   if(stageHistory[stageHistory.length - 1] === 'Interactive') {
  //     return (<Back onBack={() => this.goBack()}/>)
  //   } else {
  //     return (<div></div>)
  //   }
  // }

  render() {
    return (    
      <div className="App">
          {/* {this.returnRadioLang()}
          {this.returnBack()} */}
        <div className="App-header">
          <div>
            {/* {this.routesToStage()} */}
            ciao!
          </div>
        </div>
      </div>
    )
  }
}

// class LanguageSelection extends React.Component {
//   cycleLanguages() {
//     return(
//       <div>
//         {languages.map(x => {
//           return(
//             <div key={x.value} onClick={() => this.props.onClick({stage: 'FirstStep', language: x.value})} className="div-cliccable">
//               <p name={x.value}><code>{x.label}</code></p>
//             </div>
//           )
//         })}
//       </div>
//     )
//   }

//   render() {
//     return(
//       <div>
//         {this.cycleLanguages()}
//       </div>
//     )
//   }
// }

export default App;
