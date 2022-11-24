import React, { useState } from "react";
import $ from "jquery";
import { useEffect } from "react";
import { useHistory } from "react-router";
import { useWeb3React } from "@web3-react/core";
import axios from "axios";

const SiderBar = ({ Params }) => {
    const history = useHistory();
    const [SpinPrice, setSpinPrice] = useState();
    const toggle = () => {
        $(".menu").toggleClass("active");
    };

    const selectSiderBar = (params) => {
        console.log(params);
        $(".pages-btn").removeClass("active");
        $(`#${params}`).addClass("active");
        history.push(params);
    };

    return (
        <div className="left-side">
            <div className="menu" style={{ position: "fixed" }}>
                <div
                    className="left-closing-arrow"
                    onClick={() => toggle()}
                ></div>
                <div className="menu-btns">
                    <a onClick={() => selectSiderBar("home")}>
                        <div className="pages-btn" id="home">
                            <img src="./assets/images/home.svg" alt="" />
                            <img src="./assets/images/home_active.svg" alt="" />
                            <span>Home</span>
                        </div>
                    </a>
                </div>
            </div>
            <div
                className="extra-info"
                style={{ position: "fixed", top: "450px" }}
            >
                <div className="social-media">
                    <img src="./assets/images/gitbook.svg" alt="" />
                    <img src="./assets/images/discord.svg" alt="" />
                    <a href="https://twitter.com/SpintopNetwork">
                        <img src="./assets/images/twitter.svg" alt="" />
                    </a>
                    <img src="./assets/images/telegram.svg" alt="" />
                </div>
                <div className="audit">
                    <span>Audit in progress</span>
                </div>
                <img
                    src="./assets/images/certik_logo.svg"
                    alt="/"
                    className="certik-logo"
                />
            </div>
        </div>
    );
};

export default SiderBar;
