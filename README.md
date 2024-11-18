# Braavos Session Key Sample App

This repository provides a simple way to explore and experiment with the **Braavos Session Key feature** using the accompanying npm package. This dapp allows you to:

### 1. **Sign a Gas-Sponsored Session**
- Initiate a gas-sponsored session by clicking the `SIGN GS SESSION` button.
- A prompt will appear to sign the gas-sponsored session request.
- Modify the session request by editing the JSON request object. Note that the `callerAddress` is pre-set to the connected account.
- Upon signing, the wallet generates a `Signature` object, stored locally in the browser. In production scenarios, this signature can be sent to a backend for use in subsequent transactions.

### 2. **Send a Gas-Sponsored Transaction**
- Click the `SEND GS CALL` button to send a gas-sponsored transaction. The wallet will prompt the `callerAddress` (also the session account by default in this example) to sign the transaction.
- The app utilizes the stored `Signature` object to craft the necessary calldata behind the scenes.
- The attempted transaction will transfer 1 wei of ETH back to the connected account.

### 3. **Sign an Account Session Request**
- Initiate an account session by clicking the `SIGN ACCOUNT SESSION` button.
- A prompt will appear to sign an account session key request.
- Modify the session request object via the editable JSON configuration.
- After signing, the wallet generates a `SessionAccount` object, which is stored locally in the browser. In a real-world implementation, this object can be used to submit transactions on behalf of the user.

### 4. **Send an Account Session Transaction**
- Clicking `SEND SESSION TRANSACTION` submits a transaction using the stored `SessionAccount`, without requiring additional wallet prompts.
- Ensure the session account has sufficient STRK balance to execute transactions.
- If the transaction is submitted successfully a url to a block explorer will appear.

## Available Scripts

In the project directory, you can run:

### `yarn`

Install all dependencies, must be run first

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

You can zip up the build folder contents and upload it to amplify.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about
[deployment](https://facebook.github.io/create-react-app/docs/deployment) for more
information.
