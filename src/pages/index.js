import React, { useCallback, useEffect, useState } from "react";
import Fab from "@mui/material/Fab";
import { Row, Col } from "reactstrap";
import {
    Button,
    Skeleton,
    Typography,
    Box,
    OutlinedInput,
    TextField,
    Stack,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import LanguageIcon from "@mui/icons-material/Language";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
//web3
import Web3 from "web3";
import axios from "axios";
import { useWeb3React } from "@web3-react/core";
//file
import SiderBar from "./siderbar";
import Config from "../config/app";
import Cwallet from "../components/Cwallet";
const Home = () => {
    // eslint-disable-next-line
    const { active, account, library } = useWeb3React();
    const [isOpenDialog, setIsOpenDialog] = useState(false);
    const [rewardAmount, setRewardAmount] = useState(-1);
    const [walletBalance, setWalletBalance] = useState(-1);
    const [totalMinted, setTotalMinted] = useState(-1);
    const [totalBurned, setTotalBurned] = useState(-1);
    const [stakeAmount, setStakeAmount] = useState(0);
    const [stakedAmount, setStakedAmount] = useState(0);
    const [unstakeAmount, setUnstakeAmount] = useState(0);

    const web3 = new Web3(library.provider);
    const TokenContract = new web3.eth.Contract(
        Config.Token.abi,
        Config.Token.address
    );
    const StakingContract = new web3.eth.Contract(
        Config.Staking.abi,
        Config.Staking.address
    );

    const fromWei = useCallback((web3, val) => {
        if (val) {
            val = val.toString();
            return web3.utils.fromWei(val);
        } else {
            return "0";
        }
    }, []);

    const onConnectWallet = async () => {
        setIsOpenDialog(true);
    };

    const floor = useCallback((val) => {
        if (val != 0) {
            let data = Math.floor(val * 10000);
            const res = data / 10000;
            return res;
        } else {
            return 0;
        }
    });

    const addToken = () => {
        if (window.ethereum) {
            window.ethereum.request({
                method: "wallet_watchAsset",
                params: {
                    type: "ERC20", // Initially only supports ERC20, but eventually more!
                    options: {
                        address: Config.Token.address, // The address that the token is at.
                        symbol: Config.Token.symbol, // A ticker symbol or shorthand, up to 5 chars.
                        decimals: 18,
                        image: Config.Token.img,
                    },
                },
            });
        }
    };

    const swn = () => {
        if (window.ethereum) {
            window.ethereum
                .request({
                    method: "wallet_addEthereumChain",
                    params: [
                        {
                            chainId: `0x${Config.netId.toString(16)}`,
                            chainName: "BNB TEST Network",
                            rpcUrls: [
                                "https://data-seed-prebsc-1-s1.binance.org:8545",
                            ],
                            nativeCurrency: {
                                name: "BNB",
                                symbol: "BNB",
                                decimals: 18,
                            },
                            blockExplorerUrls: ["https://testnet.bscscan.com"],
                        },
                    ],
                })
                .then(() => {
                    alert(
                        "You have successfully changed to Spin Test Network.",
                        "info"
                    );
                })
                .catch((error) => {
                    alert(error.toString(), "error");
                });
        }
    };

    const load = async () => {
        if (active) {
            try {
                const walletB = await TokenContract.methods
                    .balanceOf(account)
                    .call();
                console.log(walletB);
                const totalMint = await TokenContract.methods
                    .totalSupply()
                    .call();
                const totalstaked = await StakingContract.methods
                    .totalStaked()
                    .call();
                // const totalburned = await spinT.methods.totalSupply().call();
                const rewardVal = await StakingContract.methods
                    .earned(account)
                    .call();

                const stakedVal = await StakingContract.methods
                    .balanceOf(account)
                    .call();
                setStakedAmount(web3.utils.fromWei(stakedVal));
                setWalletBalance(floor(fromWei(web3, walletB)));
                setTotalMinted(floor(fromWei(web3, totalMint)));
                setRewardAmount(floor(fromWei(web3, rewardVal)));
                setTotalBurned(0);
            } catch (err) {
                console.log(err);
            }
        }
    };

    const stake = async () => {
        try {
            if (stakeAmount > 0) {
                const web3 = new Web3(library.provider);
                const val = web3.utils.toWei(stakeAmount.toString());

                const allowanceVal = await TokenContract.methods
                    .allowance(account, Config.Staking.address)
                    .call();
                let approve;
                if (web3.utils.fromWei(allowanceVal) < stakeAmount) {
                    approve = await TokenContract.methods
                        .approve(Config.Staking.address, val)
                        .send({ from: account });
                }
                const data = await StakingContract.methods
                    .stake(val)
                    .send({ from: account });
                load();
            }
        } catch (e) {
            console.log(e);
        }
    };

    const reward = async () => {
        try {
            if (rewardAmount > 0) {
                const data = await StakingContract.methods
                    .getReward()
                    .send({ from: account });
                load();
            }
        } catch (e) {
            console.log(e);
        }
    };

    const unStake = async () => {
        try {
            if (unstakeAmount > 0) {
                const val = web3.utils.toWei(unstakeAmount.toString());
                const data = await StakingContract.methods
                    .unstake(val)
                    .send({ from: account });
                load();
            }
        } catch (e) {
            console.log(e);
        }
    };

    const clear = () => {
        setWalletBalance(-1);
        setRewardAmount(-1);
        setTotalMinted(-1);
        setTotalBurned(-1);
    };

    useEffect(() => {
        let interval = null;
        if (active) {
            load();
            interval = setInterval(async () => {
                load();
            }, Config.updateTime);
        } else {
            clear();
            return () => clearInterval(interval);
        }
    }, [active]);

    return (
        <Box>
            <Box className="main-container">
                <SiderBar Params="home" />
                <Box className="right-side">
                    <Row>
                        <Col>
                            <Box className="big-announc">
                                <Typography>TOKEN</Typography>
                                <Typography>
                                    Gaming exclusive AMM, Staking & Farming
                                    pools and the TOKEN Wallet.
                                </Typography>
                            </Box>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Box className="cust-card main_card">
                                <Typography className="main-heading">
                                    Staking
                                </Typography>
                                <Box className="meta-mask">
                                    <Box>
                                        <img
                                            src="./assets/images/Spintoken.svg"
                                            alt=""
                                            className="spintoken"
                                        />
                                        <Fab
                                            variant="extended"
                                            size="small"
                                            color="primary"
                                            aria-label="add"
                                            title="Add Token"
                                            onClick={() => addToken()}
                                            style={{
                                                background: "rgb(33 15 60)",
                                            }}
                                        >
                                            <img
                                                src="./assets/images/logo.png"
                                                style={{
                                                    height: "20px",
                                                    margin: "0px",
                                                }}
                                            />
                                            &nbsp;&nbsp;&nbsp;
                                            <KeyboardDoubleArrowRightIcon
                                                sx={{ mr: 1 }}
                                            />
                                            <img
                                                width={22}
                                                src="./assets/images/meta-mask.svg"
                                                style={{ margin: "0px" }}
                                                alt="connected"
                                            />
                                        </Fab>
                                    </Box>
                                    <Fab
                                        variant="extended"
                                        size="small"
                                        color="primary"
                                        aria-label="add"
                                        title="Add NetWork"
                                        onClick={() => swn()}
                                        style={{ background: "rgb(33 15 60)" }}
                                    >
                                        <LanguageIcon sx={{ mr: 1 }} />
                                        <KeyboardDoubleArrowRightIcon
                                            sx={{ mr: 1 }}
                                        />
                                        <img
                                            width={22}
                                            src="./assets/images/meta-mask.svg"
                                            style={{ margin: "0px" }}
                                            alt="connected"
                                        />
                                    </Fab>
                                </Box>
                                <Box className="spin-text">TOKEN to claim</Box>
                                {(() => {
                                    if (rewardAmount != -1) {
                                        return (
                                            <Typography
                                                className="value big"
                                                color="primary"
                                            >
                                                <span className="sub-txt">
                                                    {rewardAmount}&nbsp;TOKEN
                                                </span>
                                                <br />
                                                {/* <span className="money">
                                                    ~$
                                                    {rewardAmount * SpinPrice}
                                                </span> */}
                                            </Typography>
                                        );
                                    } else {
                                        return (
                                            <Typography>
                                                <Skeleton
                                                    animation="wave"
                                                    className="skelton"
                                                />
                                            </Typography>
                                        );
                                    }
                                })()}
                                <Box className="spin-text">TOKEN in wallet</Box>
                                {(() => {
                                    if (walletBalance != -1) {
                                        return (
                                            <Typography
                                                className="value big"
                                                color="primary"
                                            >
                                                <span className="sub-txt">
                                                    {walletBalance}&nbsp;TOKEN
                                                </span>
                                                <br />
                                                {/* <span className="money">
                                                    ~$
                                                    {floor(
                                                        walletBalance *
                                                            SpinPrice
                                                    )}
                                                </span> */}
                                            </Typography>
                                        );
                                    } else {
                                        return (
                                            <Typography>
                                                <Skeleton
                                                    animation="wave"
                                                    className="skelton"
                                                />
                                            </Typography>
                                        );
                                    }
                                })()}
                                {active ? (
                                    <Button
                                        variant="contained"
                                        className="contract-btn2 contract-res"
                                        startIcon={
                                            <AccountBalanceWalletRoundedIcon />
                                        }
                                        color="secondary"
                                        onClick={onConnectWallet}
                                    >
                                        {account.substring(0, 10)} ...{" "}
                                        {account.substring(account.length - 5)}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="contained"
                                        className="contract-btn2 contract-res"
                                        startIcon={<LockIcon />}
                                        color="secondary"
                                        onClick={onConnectWallet}
                                    >
                                        unlock wallet
                                    </Button>
                                )}
                                <Cwallet
                                    isOpen={isOpenDialog}
                                    setIsOpen={setIsOpenDialog}
                                />
                            </Box>
                        </Col>

                        <Col md={6}></Col>

                        <Col md={6}>
                            <Box className="cust-card main_card">
                                <Typography className="main-heading">
                                    Stake token!
                                </Typography>
                                <Box>
                                    <Box className="spin-text">
                                        Amount to stake
                                    </Box>
                                    <TextField
                                        label="Amount"
                                        fullWidth
                                        value={stakeAmount}
                                        onChange={(e) =>
                                            setStakeAmount(e.target.value)
                                        }
                                    ></TextField>
                                </Box>
                                <Box className="spin-text">
                                    Amount to reward
                                </Box>
                                {(() => {
                                    // if (rewardAmount != -1) {
                                    return (
                                        <Stack
                                            direction="row"
                                            justifyContent={"space-between"}
                                            alignItems="center"
                                        >
                                            <Typography
                                                className="value big"
                                                color="primary"
                                            >
                                                <span className="sub-txt">
                                                    {rewardAmount}
                                                    &nbsp;TOKEN
                                                </span>
                                                <br />
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                onClick={reward}
                                            >
                                                Claim
                                            </Button>
                                        </Stack>
                                    );
                                    // } else {
                                    //     return (
                                    //         <Typography>
                                    //             <Skeleton
                                    //                 animation="wave"
                                    //                 className="skelton"
                                    //             />
                                    //         </Typography>
                                    //     );
                                    // }
                                })()}

                                {active ? (
                                    <Button
                                        variant="contained"
                                        className="contract-btn2 contract-res"
                                        color="secondary"
                                        onClick={stake}
                                    >
                                        Stake
                                    </Button>
                                ) : (
                                    <Button
                                        variant="contained"
                                        className="contract-btn2 contract-res"
                                        startIcon={<LockIcon />}
                                        color="secondary"
                                        onClick={onConnectWallet}
                                    >
                                        unlock wallet
                                    </Button>
                                )}
                            </Box>
                        </Col>

                        <Col md={6}>
                            <Box className="cust-card main_card">
                                <Typography className="main-heading">
                                    UnStake token!
                                </Typography>
                                <Box>
                                    <Box className="spin-text">
                                        Amount to unstake
                                    </Box>
                                    <TextField
                                        label="Amount"
                                        fullWidth
                                        value={unstakeAmount}
                                        onChange={(e) =>
                                            setUnstakeAmount(e.target.value)
                                        }
                                    ></TextField>
                                </Box>
                                <Box className="spin-text">Staked Amount</Box>
                                {(() => {
                                    if (stakedAmount) {
                                        return (
                                            <Typography
                                                className="value big"
                                                color="primary"
                                            >
                                                <span className="sub-txt">
                                                    {stakedAmount}
                                                    &nbsp;TOKEN
                                                </span>
                                                <br />
                                            </Typography>
                                        );
                                    } else {
                                        return (
                                            <Typography>
                                                <Skeleton
                                                    animation="wave"
                                                    className="skelton"
                                                />
                                            </Typography>
                                        );
                                    }
                                })()}

                                {active ? (
                                    <Button
                                        variant="contained"
                                        className="contract-btn2 contract-res"
                                        color="secondary"
                                        onClick={unStake}
                                    >
                                        UnStake
                                    </Button>
                                ) : (
                                    <Button
                                        variant="contained"
                                        className="contract-btn2 contract-res"
                                        startIcon={<LockIcon />}
                                        color="secondary"
                                        onClick={onConnectWallet}
                                    >
                                        unlock wallet
                                    </Button>
                                )}
                            </Box>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Box className="cust-card main_card small-card">
                                <p className="small-p">Total Minted</p>
                                {(() => {
                                    if (totalMinted != -1) {
                                        return (
                                            <Typography
                                                className="value big"
                                                color="primary"
                                            >
                                                <span className="sub-txt">
                                                    {totalMinted}&nbsp;TOKEN
                                                </span>
                                            </Typography>
                                        );
                                    } else {
                                        return (
                                            <Typography>
                                                <Skeleton
                                                    animation="wave"
                                                    className="skelton"
                                                />
                                            </Typography>
                                        );
                                    }
                                })()}
                            </Box>
                        </Col>
                        <Col md={6}>
                            <Box className="cust-card main_card small-card">
                                <p className="small-p">Total Staked</p>
                                {(() => {
                                    if (totalBurned != -1) {
                                        return (
                                            <Typography
                                                className="value big"
                                                color="primary"
                                            >
                                                <span className="sub-txt">
                                                    {totalBurned}&nbsp;TOKEN
                                                </span>
                                            </Typography>
                                        );
                                    } else {
                                        return (
                                            <Typography>
                                                <Skeleton
                                                    animation="wave"
                                                    className="skelton"
                                                />
                                            </Typography>
                                        );
                                    }
                                })()}
                            </Box>
                        </Col>
                    </Row>
                </Box>
            </Box>
        </Box>
    );
};

export default Home;
