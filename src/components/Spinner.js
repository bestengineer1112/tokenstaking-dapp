import React from "react";

const Spinner = () => {
    return (
        <div>
            <div className="loading-div">
                <div className="loader">
                    <span className="loading-span"></span>
                    <span className="loading-span"></span>
                    <span className="loading-span"></span>
                    <span className="loading-span"></span>
                </div>
            </div>
        </div>
    )
}

export default Spinner;