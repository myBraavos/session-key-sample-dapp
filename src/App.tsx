import { useEffect, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Grid,
    Link,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { StarknetWindowObject, connect } from "get-starknet";
import { getStarknet } from "get-starknet-core";
import { signGasSponsoredSessionRequest, getGasSponsoredSessionTx, requestSessionAccount } from "starknet-sessions";
import { Signature, AccountInterface } from "starknet";

const sessionGSRequest = {
    callerAddress: "0x04a14a9ead8ad57697d76cf0ab69d209bacbbaf078963e5316b9348a860191c5",
    sessionAccountAddress: "0x06018c5e4fa07fedee5c8ab05784ac66e45c9acabb814d313d0e31768d5f38b4",
    executeAfter: new Date(0),
    executeBefore: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    requestedMethods: [
        {
            contractAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7", entrypoint: "transfer", calldataValidations: [
                {
                    validationType: 0 as const,
                    offset: 0,
                    value: "0x0089fd6febc2033fd3061b6ccfc841b9f98b5afbfea445fbcecedb1686994468"
                }
            ]
        },
        {
            contractAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7", entrypoint: "approve", calldataValidations: [

            ]
        },
        {
            contractAddress: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d", entrypoint: "transfer", calldataValidations: [
            ]
        },
        {
            contractAddress: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d", entrypoint: "approve", calldataValidations: [
            ]
        }
    ],
    spendingLimits: [{ tokenAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7", amount: { low: 10000000000000000, high: 0 } }]
}

const sessionRequest = {
    executeAfter: new Date(0),
    executeBefore: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    strkGasLimit: "10000000000000000000",
    requestedMethods: [
        { contractAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7", entrypoint: "transfer" },
        { contractAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7", entrypoint: "approve" },
        { contractAddress: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d", entrypoint: "transfer" },
        { contractAddress: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d", entrypoint: "approve" }
    ],
    spendingLimits: [{ tokenAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7", amount: { low: 10000000000000000, high: 0 } }]
}

function SignComplexMessage({ address }: { address: string | undefined }) {
    const [sessionGSRequestData, setSessionGSRequestData] = useState(JSON.stringify(address ? { ...sessionGSRequest, callerAddress: address } : sessionGSRequest, null, 2));
    const [accountSessionRequestData, setAccountSessionRequestData] = useState(JSON.stringify(sessionRequest, null, 2));
    const [txHash, setTxHash] = useState<string | undefined>(undefined);
    const [gsSignature, setGSSignature] = useState<Signature | undefined>(undefined);
    const [sessionAccount, setSessionAccount] = useState<AccountInterface | undefined>(undefined);

    const signGSExecSession = async () => {
        const wallet = await getStarknet().getLastConnectedWallet();
        const request = JSON.parse(sessionGSRequestData);
        if (wallet?.isConnected && request) {
            request["executeAfter"] = new Date(request["executeAfter"]);
            request["executeBefore"] = new Date(request["executeBefore"]);
            sessionGSRequest.sessionAccountAddress = wallet.account.address;
            const signature = await signGasSponsoredSessionRequest(wallet.account, request, "v2")
            setGSSignature(signature);
        }
    }

    const sendGSTransaction = async () => {
        const wallet = await getStarknet().getLastConnectedWallet();
        if (wallet?.isConnected) {
            const res = await getGasSponsoredSessionTx({
                calls: [
                    {
                        contractAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                        entrypoint: "transfer",
                        calldata: ["0x0089fd6febc2033fd3061b6ccfc841b9f98b5afbfea445fbcecedb1686994468", 1, 0]
                    }
                ],
                ...sessionGSRequest,
                gsSessionSignature: gsSignature!,
            }, "v2")
            await wallet.account.execute(res);
        }
    }

    const generateSessionAccount = async () => {
        const wallet = await getStarknet().getLastConnectedWallet();
        const request = JSON.parse(accountSessionRequestData);
        if (wallet?.isConnected && request) {
            request["executeAfter"] = new Date(request["executeAfter"]);
            request["executeBefore"] = new Date(request["executeBefore"]);
            const account = await requestSessionAccount(wallet.provider, wallet.account, request)
            setSessionAccount(account);
        }
    }

    const executeSessionTx = async () => {
        if (sessionAccount) {
            const res = await sessionAccount.execute([
                {
                    contractAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                    entrypoint: "transfer",
                    calldata: [sessionAccount.address, 1, 0]
                }
            ]);
            setTxHash(res.transaction_hash);
        }
    }

    return (
        <Card sx={{ width: "100%" }}>
            <CardHeader title={"Sessions"} />
            <CardContent>
                <CardHeader title={"Gas Sponsored Sessions"} />
                <Stack style={{ paddingLeft: 20 }}>
                    <TextField
                        value={sessionGSRequestData}
                        style={{ maxWidth: "90%" }}
                        rows={10}
                        multiline={true}
                        placeholder={"Session request"}
                        onChange={e => {
                            setSessionGSRequestData(e.currentTarget.value);
                        }}
                    />

                    <Button
                        sx={{ mt: 2, width: "50%" }}
                        variant={"contained"}
                        onClick={() => signGSExecSession()}>
                        {"Sign GS session"}
                    </Button>
                    <Button
                        sx={{ mt: 2, width: "50%" }}
                        variant={"contained"}
                        disabled={!gsSignature}
                        onClick={() => sendGSTransaction()}>
                        {"Send GS call"}
                    </Button>
                </Stack>
                <CardHeader title={"Account Sessions"} style={{ marginTop: 10 }} />
                <Stack style={{ paddingLeft: 20 }}>
                    <TextField
                        value={accountSessionRequestData}
                        style={{ maxWidth: "90%" }}
                        rows={10}
                        multiline={true}
                        placeholder={"Session request"}
                        onChange={e => {
                            setAccountSessionRequestData(e.currentTarget.value);
                        }}
                    />
                    <Button
                        sx={{ mt: 2, width: "50%" }}
                        variant={"contained"}
                        onClick={() => generateSessionAccount()}>
                        {"Sign Account Session"}
                    </Button>
                    <Button
                        sx={{ mt: 2, width: "50%" }}
                        variant={"contained"}
                        disabled={!sessionAccount}
                        onClick={() => executeSessionTx()}>
                        {"Send Session Transaction"}
                    </Button>
                    {
                        txHash && 
                        <Link href={`https://starkscan.co/tx/${txHash}`} target="_blank" rel="noopener" sx={{ color: 'primary.main', fontSize: 18 }}>
                            View Transaction
                        </Link>
                    }
                </Stack>
            </CardContent>
        </Card>
    );
}

function Commands({ address }: { address: string | undefined }) {
    return (
        <Grid sx={{ padding: 4 }} container rowSpacing={8} columnSpacing={8}>
            <Grid item xs={6}>
                <SignComplexMessage address={address} />
            </Grid>
        </Grid>
    );
}

function App() {
    const [connectedWallet, setConnectedWallet] = useState<StarknetWindowObject | undefined>(undefined);

    // silently attempt to connect with a pre-authorized wallet
    useEffect(() => {
        // match the dapp with a wallet instance
        connect({ modalMode: "neverAsk" }).then(wallet => {
            // connect the dapp with the chosen wallet instance
            wallet?.enable({ starknetVersion: "v4" }).then(() => {
                setConnectedWallet(wallet);
            });
        });
    }, []);

    useEffect(() => {
        getStarknet()
            .getLastConnectedWallet()
            .then(wallet => {
                if (!wallet?.isConnected) {
                    setConnectedWallet(undefined);
                }
            });
    });

    return !connectedWallet ? (
        <Stack sx={{ padding: 5 }} direction={"column"} justifyContent={"center"}>
            <Stack direction={"row"} alignItems={"center"}>
                <Typography variant={"h5"}>{"Welcome!"}</Typography>
            </Stack>

            <Box>
                <Typography variant={"body1"} sx={{ mt: 2 }}>
                    {"Please connect with your wallet"}
                </Typography>
                <Button
                    sx={{ mt: 1 }}
                    variant={"contained"}
                    onClick={async () => {
                        try {
                            connect({
                                modalMode: "canAsk",
                                include: ["braavos"],
                            }).then(wallet => {
                                if (wallet) {
                                    wallet.enable({ starknetVersion: "v4" }).then(() => {
                                        setConnectedWallet(wallet!);
                                    });
                                }
                            });
                        } catch (err) {
                            console.error(err);
                        }
                    }}>
                    {"Connect Wallet"}
                </Button>
            </Box>
        </Stack>
    ) : (
        <Commands address={connectedWallet.selectedAddress} />
    );
}

export default App;
