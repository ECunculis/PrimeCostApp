import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import Table from 'react-bootstrap/Table';

class GeneralizedTable extends React.Component {
    // constructor(props) {
    //     super(props)
    // }
  
	render() {
		return (
            <>
               <Table striped bordered hover size="sm"> 
                    <TableHeader headerNames={this.props.headerNames}/>
                    {this.props.tableBody}
                </Table>
            </>
		);
	}
}

function TableHeader(props) {
    let headerList = []
    props.headerNames.forEach(item => {
        headerList.push(
            <th key={item.toString()}>{item}</th>
        )
    })
    
    return (
        <thead className="text-center">
            <tr>
                {headerList}
            </tr>
        </thead>
    )
}

export default GeneralizedTable