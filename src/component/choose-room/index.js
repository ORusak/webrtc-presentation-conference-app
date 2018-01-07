import React from 'react'

const ChooseRoom = () => (
    <div className="container h-100">
        <form>
            <div className="form-group">
                <label htmlFor="roomName">Presentation room</label>
                <input
                    type="text"
                    className="form-control"
                    id="roomName"
                    placeholder="Enter number room"/>
            </div>
            <div className="form-group">
                <label htmlFor="userName">Name</label>
                <input
                    type="text"
                    className="form-control"
                    id="userName"
                    placeholder="Enter your show name"/>
            </div>
            <div className="form-group">
                <label>Type room participant</label>
                <div className="custom-control custom-radio">
                    <input
                        type="radio"
                        id="typeOwner"
                        name="typeUser"
                        className="custom-control-input"/>
                    <label className="custom-control-label" htmlFor="typeOwner">Owner</label>
                </div>
                <div className="custom-control custom-radio">
                    <input
                        type="radio"
                        id="typeVisitor"
                        name="typeUser"
                        className="custom-control-input"/>
                    <label className="custom-control-label" htmlFor="typeVisitor">Visitor</label>
                </div>
            </div>
            <button type="submit" className="btn btn-primary">Confirm</button>
        </form>
    </div>
)

export default ChooseRoom
