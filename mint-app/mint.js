const Handlers = [
  "",
  "Harvest",
  "Process",
  "Pack",
  "Sell",
  "Buy",
  "Ship",
  "Receive",
  "Purchase",
  "Fetch"
];

const App = {
  web3: null,
  contract: null,
  account: null,

  init: async () => {
    try {
      await App.initWeb3();
      await App.initAccount();
      await App.initContract();
      App.bindEvents();
    } catch (error) {
      console.error(error);
    }
  },

  initWeb3: async () => {
    let provider;
    if (window.ethereum) {
      provider = window.ethereum;
      await provider.enable();
    } else if (window.web3) {
      provider = window.web3.currentProvider;
    } else {
      provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }

    App.web3 = new Web3(provider);
  },

  initAccount: async () => {
    const accounts = await App.web3.eth.getAccounts();
    App.account = accounts[0];
  },

  initContract: async () => {
    const json = await $.getJSON('./SolnSquareVerifier.json');

    const networkId = await App.web3.eth.net.getId();
    console.log(networkId);
    const network = json.networks[networkId];

    App.contract = new App.web3.eth.Contract(
      json.abi,
      network.address,
    );
  },

  bindEvents: () => {
    $('button').on('click', App.handleMint);
  },

  readData: async () => {
    return {
      tokenId: $("#tokenId").val(),
      proofJson: JSON.parse($("#proofJson").val()),
    }
  },

  handleMint: async (event) => {
    event.preventDefault();
    try {
      const data = await App.readData();
      console.log(data);
      await App.initAccount();
      await App.contract.methods.mint(App.account, data.tokenId, data.proofJson.proof, data.proofJson.inputs).send({from: App.account})
      console.log(`minted ${data.tokenId} to ${App.account}`);
    } catch (error) {
      console.error(error);
    }
  }
};

$(() => {
  $(window).load(() => {
    App.init();
  });
});
