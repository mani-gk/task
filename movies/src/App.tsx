import './App.css'

import React from 'react'

import { apiHost } from './globals'
import logo from './logo.svg'
import { MovieRow, Table } from './Table'

export interface AppProps {

}
export interface AppState {
    isLoading: boolean
    moviesList?: MovieRow[]
    error?: string
}
export class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props)
        this.state = {
            isLoading: true
        }
    }

    componentDidMount() {
        //TODO
        fetch(`${apiHost}/api/v1/movies`, { mode: 'cors' })
            .then(res => res.json())
            .then(
                //TODO
                (result: any[]) => {
                    console.log(result)
                    this.setState({
                        isLoading: false,
                        moviesList: result.map((r, i) => ({ ...r, cast: (r.cast || []).join(", "), slNo: i + 1 }))
                    });
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    this.setState({
                        isLoading: false,
                        error: error instanceof Error ? error.message : JSON.stringify(error)
                    });
                }
            )
    }

    render() {
        const state = this.state
        return <div className="App">
            {state.isLoading && <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p> Edit <code>src/App.tsx</code> and save to reload. </p>
                <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer" >Learn React</a>
            </header>}
            <Table moviesList={state.moviesList || []}></Table>
            {/* TODO */}
            {state.error && <p>{state.error}</p>}
        </div>
    }
}