import 'react-table/react-table.css'
import React from 'react'
import ReactTable from 'react-table'

export interface MovieRow {
  slNo: number
  title: string
  num_favs: string
  cast: string
  year: string
}

const columns: { Header: string, accessor: keyof MovieRow }[] = [{
  Header: 'S.No',
  accessor: 'slNo'
}, {
  Header: 'Title',
  accessor: 'title'
}, {
  Header: 'Num of favorites (num_favs)',
  accessor: 'num_favs',
}, {
  Header: "Cast(Comma eperated values)",
  accessor: 'cast'
}, {
  Header: "Year",
  accessor: 'year'
}
]

export interface TableProps {
  moviesList: MovieRow[]
}
export interface TableState {

}
export class Table extends React.Component<TableProps, TableState> {
  render() {
    const data = this.props.moviesList
    return <ReactTable
      data={data}
      columns={columns}
    />
  }
}