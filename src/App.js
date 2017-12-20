import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {getTimers, createTimer, resetAll, updateTimer, deleteTimer, stopTimer, startTimer} from "./client";
import {millisecondsToHuman, newTimer, renderElapsedString} from "./helpers";


class App extends React.Component{

    state = {
        timers: [
        ],
        totalTime: "empty"
    };

    componentDidMount(){
        this.loadTimersFromServer();
        setInterval(this.loadTimersFromServer,5000);
        console.log("test")
    }

    loadTimersFromServer = ()=>{
        getTimers((serverTimers)=>{
            this.setState({timers:serverTimers})
        })
    }

    handleCreateFormSubmit = (timer) =>{
        this.createTimer(timer);
    }

    createTimer = (timer) =>{
        const t = newTimer(timer);
        this.setState({
            timers:this.state.timers.concat(t),
        })
        createTimer(t);
    }

    handleStartClick = (timerId) =>{
        this.startTimer(timerId)
    }

    handleStopClick = (timerId) =>{
        this.stopTimer(timerId)
    }

    startTimer = (timerId) =>{
        const now = Date.now();

        this.setState({
            timers:this.state.timers.map((timer)=>{
                if(timer.id === timerId){
                    return Object.assign({}, timer, {
                        runningSince:now
                    })
                }else{
                    return timer
                }
            })
        })

        startTimer({
            id:timerId, start: now
        })
    }

    stopTimer = (timerId) =>{
        const now = Date.now();

        this.setState({
            timers:this.state.timers.map((timer)=>{
                if(timer.id === timerId){
                    const lastElapsed = now - timer.runningSince;
                    return Object.assign({},timer,{
                        elapsed:timer.elapsed + lastElapsed,
                        runningSince:null
                    })
                }else{
                    return timer
                }
            })
        })

        stopTimer({
            id:timerId,stop:now
        })
    }

    handleFormUpdate = (timer) =>{
        const newTimer = this.state.timers.map((oldTimer) =>{
            if(oldTimer.id === timer.id){
                return Object.assign({}, oldTimer,{
                    project: timer.project,
                    title: timer.title
                });
            }else{
                return oldTimer;
            }
        });


        this.setState({
            timers: newTimer,
        })

        updateTimer(timer)
    }

    handleResetAll = () =>{
        const newTimers = this.state.timers.map((timer) =>{
            return Object.assign({},timer,{
                elapsed: 0
            });
        })

        this.setState({
            timers:newTimers
        })

        resetAll()
    }

    handleTrashClick = (timer)=>{
        console.log('test')
        const newtimer = this.state.timers.filter(e => e.id !== timer.id)

        this.setState({
            timers: newtimer
        })

        deleteTimer(timer)
    }


    render(){

        const elapsed = this.state.timers.reduce((pValue, cValue, cIndex, array)=>{
            return pValue + array[cIndex].elapsed
        },0)

        const elapsedString = renderElapsedString(
            elapsed, this.props.runningSince
        );
        const totalTime =elapsedString
        return (
            <div>

                <div className={'ui three column centered grid'}>
                    <EditableTimerList timers={this.state.timers} onFormSubmit={this.handleFormUpdate}
                                       onHandleTrashClick={this.handleTrashClick}
                                       onStartClick={this.handleStartClick}
                                       onStopClick={this.handleStopClick}
                    />
                </div>

                <b className={'ui three column centered grid'}>
                    Total time: {totalTime}
                </b>
                <ToggleableTimerForm onFormSubmit={this.handleCreateFormSubmit}
                                     onResetAll = {this.handleResetAll}
                />

            </div>
        )
    }
}

class EditableTimerList extends React.Component{

    handleFormSubmit = (timer)=>{
        this.props.onFormSubmit(timer)
    }


    render(){
        const timers = this.props.timers.map((timer) =>(
            <EditableTimer
                key={timer.id}
                id={timer.id}
                title={timer.title}
                project={timer.project}
                elapsed={timer.elapsed}
                runningSince={timer.runningSince}
                onFormSubmit = {this.handleFormSubmit}
                onHandleTrashClick = {this.props.onHandleTrashClick}
                onStartClick={this.props.onStartClick}
                onStopClick={this.props.onStopClick}
            />
        ));

        return(

            <div>
                {timers}
            </div>
        )
    }
}

class EditableTimer extends React.Component{

    state = {
        editFormOpen: false
    };

    handleFormClose = ()=>{
        this.closeForm();
    }

    handleSubmit = (timer) =>{
        this.props.onFormSubmit(timer);
        this.closeForm();
    }

    closeForm = ()=>{
        this.setState({editFormOpen:false});
    }

    openForm = () => {
        this.setState({ editFormOpen: true });
    };

    handleTrashClick = (timer)=>{
        console.log("EditableTimer test")
        this.props.onHandleTrashClick(timer)
    }

    handleEditClick = () => {
        this.openForm();
    };



    render(){
        if(this.state.editFormOpen){
            return(
                <TimerForm
                    id={this.props.id}
                    title={this.props.title}
                    project={this.props.project}
                    onFormSubmit={this.handleSubmit}
                    onFormClose={this.handleFormClose}
                />
            )
        }else{
            return (
                <Timer
                    id={this.props.id}
                    title={this.props.title}
                    project={this.props.project}
                    elapsed={this.props.elapsed}
                    runningSince={this.props.runningSince}
                    onEditClick={this.handleEditClick}
                    onTrashClick={this.handleTrashClick}
                    onStartClick={this.props.onStartClick}
                    onStopClick={this.props.onStopClick}
                />
            )
        }
    }
}

class Timer extends React.Component{

    handleTrashClick = ()=>{
        this.props.onTrashClick({
            id: this.props.id
        })
    }

    componentDidMount() {
        this.forceUpdateInterval = setInterval(() => this.forceUpdate(), 100);
        console.log("set interval")
    }

    componentWillUnmount() {
        clearInterval(this.forceUpdateInterval);
    }

    handleStartClick = ()=>{
        this.props.onStartClick(this.props.id)
    }

    handleStopClick = () => {
        console.log(this.props.id)
        this.props.onStopClick(this.props.id)
    }

    render(){
        const elapsedString = renderElapsedString(
            this.props.elapsed, this.props.runningSince
        );

        return (

            <div className={'ui card'}>
                <div className={'content'}>
                    <div className={'header'}>
                        {this.props.title}
                    </div>
                    <div className={'meta'}>
                        {this.props.project}
                    </div>
                    <div className={'center aligned description'}>
                        <h2>
                            {elapsedString}
                        </h2>
                    </div>
                    <div className={'extra content'}>
                        <span className={'right floated edit icon'} onClick={this.props.onEditClick}>
                            <i className={'edit icon'} />
                        </span>
                        <span className={'right floated trash icon'} onClick={this.handleTrashClick}>
                            <i className={'trash icon'}/>
                        </span>
                    </div>
                </div>
                <TimerActionButton
                    timerIsRunning={!!this.props.runningSince}
                    onStartClick={this.handleStartClick}
                    onStopClick={this.handleStopClick}
                />

            </div>
        );
    }
}

class TimerActionButton extends React.Component{
    render(){
        if (this.props.timerIsRunning){
            return (
                <div className={'ui bottom attached red basic button'} onClick={this.props.onStopClick}>
                    Stop
                </div>
            )
        }else{
            return(
                <div className={'ui bottom attached green basic button'} onClick={this.props.onStartClick}>
                    Start
                </div>
            )
        }
    }
}

class TimerForm extends React.Component{

    state = {
        title: this.props.title || '',
        project: this.props.project || '',
    }

    handleTitleChange=(e) =>{
        this.setState({title:e.target.value})
    }

    handleProjectChange = (e) =>{
        this.setState({project: e.target.value})
    }

    handleSubmit = () =>{
        this.props.onFormSubmit({
            id: this.props.id,
            title: this.state.title,
            project: this.state.project
        })
    }

    render(){
        console.log("this.props.id"+this.props.id);
        const submitText = this.props.id? 'Update': 'Create';
        return(
            <div className={'ui centered card'}>
                <div className={'content'}>
                    <div className={'ui form'}>
                        <div className={'field'}>
                            <label>Title</label>
                            <input type={'text'} defaultValue={this.state.title} onChange={this.handleTitleChange}/>
                        </div>
                        <div className={'field'}>
                            <label>Project</label>
                            <input type={'text'} defaultValue={this.state.project} onChange={this.handleProjectChange}/>
                        </div>
                        <div className={'ui two bottom attached buttons'}>
                            <button className={'ui basic blue button'} onClick={this.handleSubmit}>
                                {submitText}
                            </button>
                            <button className={'ui basic red button'} onClick={this.props.onFormClose}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}

class ToggleableTimerForm extends React.Component{
    state = {
        isOpen: false
    }

    handleFormOpen = () =>{
        this.setState({isOpen: true});
    }

    handleFormClose = ()=>{
        this.setState({isOpen: false});
    }

    handleFormSubmit = (timer)=>{
        this.props.onFormSubmit(timer);
        this.setState({isOpen: false});
    }

    render(){
        if(this.state.isOpen){
            return(
                <TimerForm onFormSubmit={this.handleFormSubmit} onFormClose={this.handleFormClose}/>
            );
        }else{
            return(
                <div className={'ui basic content center aligned segment'}>
                    <button className={'ui basic button icon'} onClick={this.handleFormOpen}>
                        <i className={'plus icon'}/>
                    </button>
                    <button className={'ui basic red button'} onClick={this.props.onResetAll}>
                        Reset All
                    </button>
                </div>
            );
        }
    }
}


export default App;
