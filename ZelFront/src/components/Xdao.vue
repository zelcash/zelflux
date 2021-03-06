<template>
  <div class="xdaoSection">
    <div v-if="xdaoSection === 'listproposals'">
      <el-table
        :data="filteredProposals"
        :default-sort="{prop: 'submitDate', order: 'descending'}"
        style="width: 100%"
      >
        <el-table-column type="expand">
          <template slot-scope="props">
            <p>Description: {{ props.row.description }}</p>
          </template>
        </el-table-column>
        <el-table-column
          label="Topic"
          prop="topic"
          sortable
        >
        </el-table-column>
        <el-table-column
          label="Grant Value"
          prop="grantValue"
          sortable
        >
        </el-table-column>
        <el-table-column
          label="Name/NickName"
          prop="nickName"
          sortable
        >
        </el-table-column>
        <el-table-column
          label="Submit Date"
          prop="submitDate"
          sortable
        >
          <template slot-scope="scope">
            {{ new Date(scope.row.submitDate).toLocaleString('en-GB', timeoptions) }}
          </template>
        </el-table-column>
        <el-table-column
          label="End Date"
          prop="voteEndDate"
          sortable
        >
          <template slot-scope="scope">
            {{ new Date(scope.row.voteEndDate).toLocaleString('en-GB', timeoptions) }}
          </template>
        </el-table-column>
        <el-table-column
          label="Status"
          prop="status"
          sortable
        >
        </el-table-column>
        <el-table-column align="right">
          <template
            slot="header"
            slot-scope="scope"
          >
            <el-input
              v-if="scope"
              v-model="proposalFilter"
              size="mini"
              placeholder="Type to search"
            />
          </template>
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="getProposalDetails(scope.row.hash)"
            >
              Details
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-if="xdaoSection === 'submitproposal'">
      <p>
        In this page you will be able to submit a proposal to Flux Xdao. Fields marked with * are mandatory. After your submission is paid, the proposal can't be changed. Thank you for using Flux Xdao.
      </p>
      <el-form label-width="150px">
        <el-form-item label="Topic*">
          <el-input
            placeholder="Proposal Topic"
            v-model="proposalTopic"
          >
          </el-input>
        </el-form-item>

        <el-form-item label="Grant Amount">
          <el-input
            placeholder="Grant Flux Amount"
            v-model="proposalGrantValue"
          >
          </el-input>
        </el-form-item>

        <el-form-item label="Grant Pay to Address">
          <el-input
            placeholder="Flux Address to Receive Grant"
            v-model="proposalGrantAddress"
          >
          </el-input>
        </el-form-item>

        <el-form-item label="Proposal Description*">
          <el-input
            type="textarea"
            autosize
            placeholder="Proposal Description"
            v-model="proposalDescription"
          >
          </el-input>
        </el-form-item>

        <el-form-item label="Name/NickName">
          <el-input
            class="width100"
            placeholder="Name/NickName of Proposal Owner"
            v-model="proposalNickName"
          >
          </el-input>
        </el-form-item>
      </el-form>
      <div v-if="!proposalValid">
        <ElButton @click="validateProposal">
          Validate Xdao Proposal
        </ElButton>
      </div>
      <div v-if="proposalValid">
        <br>
        <p>Proposal is Valid</p>
        <br>
        Proposal Price: {{proposalPrice}} FLUX
        <br>
        <ElButton @click="register">
          Register Flux XDAO Proposal
        </ElButton>
        <br><br>
        <div v-if="registrationHash">
          To finish registration, please do a transaction of {{proposalPrice}} Flux to address
          {{ foundationAddress }}
          with following message:
          {{ registrationHash }}
          <br><br>
          Transaction must be mined by {{ new Date(validTill).toLocaleString('en-GB', timeoptions) }}
          <br><br>
        </div>
        <div v-if="registrationHash">
          Pay with ZelCore
          <br>
          <a :href="'zel:?action=pay&coin=zelcash&address=' + foundationAddress + '&amount=' + proposalPrice + '&message=' + registrationHash + '&icon=https%3A%2F%2Fraw.githubusercontent.com%2Frunonflux%2Fflux%2Fmaster%2FZelFront%2Fsrc%2Fassets%2Fimg%2Fflux_banner.png'">
            <img
              class="zelidLogin"
              src="@/assets/img/zelID.svg"
              height="100%"
              width="100%"
            />
          </a>
        </div>
      </div>
    </div>
    <div v-if="xdaoSection === 'proposaldetail'">
      <p>
        Proposal Details
      </p>
      <el-form label-width="150px">
        <el-form-item label="Topic">
          <el-input
            placeholder="Proposal Topic"
            v-model="proposalDetail.topic"
            disabled
          >
          </el-input>
        </el-form-item>

        <el-form-item label="Proposal Description">
          <el-input
            type="textarea"
            autosize
            placeholder="Proposal Description"
            v-model="proposalDetail.description"
            disabled
          >
          </el-input>
        </el-form-item>
        <el-form-item label="Status">
          <el-input
            placeholder="Proposal Status"
            v-model="proposalDetail.status"
            disabled
          >
          </el-input>
        </el-form-item>

        <el-form-item label="Submit Date">
          <el-input
            placeholder="Proposal Submit Date"
            :value="new Date(proposalDetail.submitDate).toLocaleString('en-GB', timeoptions)"
            disabled
          >
          </el-input>
        </el-form-item>

        <el-form-item label="Vote End Date">
          <el-input
            placeholder="Proposal Vote End Date"
            :value="new Date(proposalDetail.voteEndDate).toLocaleString('en-GB', timeoptions)"
            disabled
          >
          </el-input>
        </el-form-item>

        <el-form-item label="Total Votes Required">
          <el-input
            placeholder="Total Votes Required"
            v-model="proposalDetail.votesRequired"
            disabled
          >
          </el-input>
        </el-form-item>

        <el-form-item label="Total Votes">
          <el-input
            placeholder="Total Votes"
            v-model="proposalDetail.votesTotal"
            disabled
          >
          </el-input>
        </el-form-item>

        <el-form-item label="Votes Yes">
          <el-input
            placeholder="Votes Yes"
            v-model="proposalDetail.votesYes"
            disabled
          >
          </el-input>
        </el-form-item>

        <el-form-item label="Votes No">
          <el-input
            placeholder="Votes No"
            v-model="proposalDetail.votesNo"
            disabled
          >
          </el-input>
        </el-form-item>

        <el-form-item label="Grant Amount">
          <el-input
            placeholder="Grant Flux Amount"
            v-model="proposalDetail.grantValue"
            disabled
          >
          </el-input>
        </el-form-item>

        <el-form-item label="Grant Pay to Address">
          <el-input
            placeholder="Flux Address to Receive Grant"
            v-model="proposalDetail.grantAddress"
            disabled
          >
          </el-input>
        </el-form-item>

        <el-form-item label="Name/NickName">
          <el-input
            class="width100"
            placeholder="Name/NickName of Proposal Owner"
            v-model="proposalDetail.nickName"
            disabled
          >
          </el-input>
        </el-form-item>
      </el-form>
      <div v-if="privilage === 'none'">
        <Login />
      </div>
      <div v-else>
        <div v-if="haveVoted">
          <el-form label-width="150px">
            <el-form-item label="Your Vote">
              <el-input
                class="width100"
                placeholder="Your Vote"
                v-model="myVote"
                disabled
              >
              </el-input>
            </el-form-item>
            <el-form-item label="Number of Votes">
              <el-input
                class="width100"
                placeholder="Number of Votes"
                v-model="myNumberOfVotes"
                disabled
              >
              </el-input>
            </el-form-item>
          </el-form>
        </div>
        <div v-else>
          <p>You haven't voted yet! You have a total of {{ myNumberOfVotes }} available.</p>
          <div>
            <p>
              To vote you need to first sign a message with ZelCore with your ZelID corresponding to your Flux Nodes.
            </p>
            <div>
              <a
                @click="initiateSignWS"
                :href="'zel:?action=sign&message=' + dataToSign + '&icon=https%3A%2F%2Fraw.githubusercontent.com%2Frunonflux%2Fflux%2Fmaster%2FZelFront%2Fsrc%2Fassets%2Fimg%2FzelID.svg&callback=' + callbackValueSign"
              >
                <img
                  class="zelidLogin"
                  src="@/assets/img/zelID.svg"
                  alt="Zel ID"
                  height="100%"
                  width="100%"
                />
              </a>
            </div>
            <br>
            <ElForm class="loginForm">
              <ElFormItem>
                <ElInput
                  type="text"
                  name="message"
                  placeholder="Message to Sign"
                  disabled
                  v-model="dataToSign"
                >
                  <template slot="prepend">Message: </template>
                </ElInput>
              </ElFormItem>
              <ElFormItem>
                <ElInput
                  type="text"
                  name="address"
                  placeholder="insert ZelID"
                  v-model="zelid"
                >
                  <template slot="prepend">Address: </template>
                </ElInput>
              </ElFormItem>
              <ElFormItem>
                <ElInput
                  type="text"
                  name="message"
                  placeholder="insert your signature"
                  v-model="signature"
                >
                  <template slot="prepend">Signature: </template>
                </ElInput>
              </ElFormItem>
            </ElForm>
          </div>
          <div v-if="signature">
            <p>Remember, you can't change your vote! After voting it could take around 5 minutes to see number of votes updated with your vote.</p>
            <ElButton @click="vote(false)">
              Vote No
            </ElButton>
            &nbsp; &nbsp;
            <ElButton @click="vote(true)">
              Vote Yes
            </ElButton>
            <br><br>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vuex, { mapState } from 'vuex';
import Vue from 'vue';

const Login = () => import('@/components/Login');

const store = require('store');
const qs = require('qs');
const axios = require('axios');

Vue.use(Vuex);
const vue = new Vue();

export default {
  name: 'Xdao',
  components: {
    Login,
  },
  data() {
    return {
      proposalTopic: '',
      proposalGrantValue: 0,
      proposalGrantAddress: '',
      proposalDescription: '',
      proposalNickName: '',
      proposalValid: false,
      registrationHash: '',
      foundationAddress: null,
      websocket: null,
      timeoptions: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
      proprosalsTable: [],
      proposalDetail: {},
      haveVoted: false,
      myVote: null,
      myNumberOfVotes: 0,
      proposalPrice: 500,
      dataToSign: '',
      signature: '',
      zelid: '',
      proposalFilter: '',
    };
  },
  computed: {
    ...mapState([
      'config',
      'userconfig',
      'xdaoSection',
      'privilage',
    ]),
    filteredProposals() {
      return this.proprosalsTable
        .filter((data) => !this.proposalFilter || data.topic.toLowerCase().includes(this.proposalFilter.toLowerCase()) || data.description.toLowerCase().includes(this.proposalFilter.toLowerCase()))
        .filter((x) => x.status !== 'Rejected Unpaid')
        .filter((x) => x.status !== 'Unpaid');
    },
    callbackValueSign() {
      console.log('callbackValueSign');
      const { protocol, hostname } = window.location;
      let mybackend = '';
      mybackend += protocol;
      mybackend += '//';
      const regex = /[A-Za-z]/g;
      if (hostname.match(regex)) {
        const names = hostname.split('.');
        names[0] = 'api';
        mybackend += names.join('.');
      } else {
        mybackend += this.userconfig.externalip;
        mybackend += ':';
        mybackend += this.config.apiPort;
      }
      const backendURL = store.get('backendURL') || mybackend;
      const url = `${backendURL}/zelid/providesign`;
      return encodeURI(url);
    },
  },
  watch: {
    xdaoSection(val, oldVal) {
      console.log(val, oldVal);
      this.switcher(val);
    },
    privilage() {
      const zelidauth = localStorage.getItem('zelidauth');
      const auth = qs.parse(zelidauth);
      console.log(auth);
      this.zelid = auth.zelid;
      this.loadVotes();
    },
  },
  mounted() {
    const zelidauth = localStorage.getItem('zelidauth');
    const auth = qs.parse(zelidauth);
    console.log(auth);
    this.zelid = auth.zelid;
    this.switcher(this.xdaoSection);
  },
  methods: {
    switcher(value) {
      switch (value) {
        case 'listproposals':
          this.proprosalsTable = [];
          this.cleanProposalDetail();
          this.getXdaoProposals();
          break;
        case 'submitproposal':
          this.cleanProposalSubmit();
          this.getXdaoPrice();
          break;
        case 'proposaldetail':
          break;
        case null:
          console.log('xdao Section hidden');
          break;
        default:
          console.log('xdao Section: Unrecognized method'); // should not be seeable if all works correctly
      }
    },
    cleanProposalDetail() {
      this.proposalDetail = {};
      this.haveVoted = false;
      this.myVote = null;
      this.myNumberOfVotes = 0;
      this.dataToSign = '';
      this.signature = '';
    },
    cleanProposalSubmit() {
      this.proposalTopic = '';
      this.proposalGrantValue = 0;
      this.proposalGrantAddress = '';
      this.proposalDescription = '';
      this.proposalNickName = '';
      this.proposalValid = false;
      this.registrationHash = '';
    },
    async getXdaoProposals() {
      const response = await axios.get('https://stats.runonflux.io/proposals/listProposals');
      console.log(response);
      if (response.data.status === 'success') {
        this.proprosalsTable = response.data.data;
      } else {
        vue.$customMes.error(response.data.data.message || response.data.data);
      }
    },
    async getXdaoPrice() {
      const response = await axios.get('https://stats.runonflux.io/proposals/price');
      console.log(response);
      if (response.data.status === 'success') {
        this.proposalPrice = response.data.data;
      } else {
        vue.$customMes.error(response.data.data.message || response.data.data);
      }
    },
    async getProposalDetails(hash) {
      this.proposalDetail = this.proprosalsTable.find((proposal) => proposal.hash === hash);
      if (this.proposalDetail) {
        console.log(this.proposalDetail);
        this.dataToSign = await this.getMessagePhrase();
        this.$store.commit('setXdaoSection', 'proposaldetail');
        this.loadVotes();
      } else {
        vue.$customMes.error('Proposal not found');
      }
    },
    validateProposal() {
      if (this.proposalTopic === '') {
        vue.$customMes.error('Proposal Topic is Mandatory');
        return;
      }
      if (this.proposalDescription === '') {
        vue.$customMes.error('Proposal Description is Mandatory');
        return;
      }
      if (this.proposalDescription.length < 50) {
        vue.$customMes.error('Proposal Description needs to have more details');
        return;
      }
      if (this.proposalTopic.length < 3) {
        vue.$customMes.error('Proposal Topic needs to have more words');
        return;
      }
      if (this.proposalGrantValue) {
        const isnum = /^\d+$/.test(this.proposalGrantValue);
        if (isnum === true) {
          if (this.proposalGrantValue > 0 && !this.proposalGrantAddress) {
            vue.$customMes.error('Proposal Grant Pay to Address missing');
            return;
          }
        } else {
          vue.$customMes.error('Proposal Grant Amount needs to be a Integer Number');
          return;
        }
      }
      if (this.proposalGrantAddress) {
        if (/\s/.test(this.proposalGrantAddress)) {
          vue.$customMes.error('Proposal Grant Pay to Address Invalid, white space detected');
          return;
        }
      }
      this.proposalValid = true;
    },
    initiateSignWS() {
      console.log('initiateSignWS');
      const self = this;
      const { protocol, hostname } = window.location;
      let mybackend = '';
      mybackend += protocol;
      mybackend += '//';
      const regex = /[A-Za-z]/g;
      if (hostname.match(regex)) {
        const names = hostname.split('.');
        names[0] = 'api';
        mybackend += names.join('.');
      } else {
        mybackend += this.userconfig.externalip;
        mybackend += ':';
        mybackend += this.config.apiPort;
      }
      let backendURL = store.get('backendURL') || mybackend;
      backendURL = backendURL.replace('https://', 'wss://');
      backendURL = backendURL.replace('http://', 'ws://');
      const wsIdentifier = this.zelid + this.dataToSign.substr(this.dataToSign.length - 13);
      const wsuri = `${backendURL}/ws/sign/${wsIdentifier}`;
      const websocket = new WebSocket(wsuri);
      this.websocket = websocket;

      websocket.onopen = (evt) => { self.onOpen(evt); };
      websocket.onclose = (evt) => { self.onClose(evt); };
      websocket.onmessage = (evt) => { self.onSignMessage(evt); };
      websocket.onerror = (evt) => { self.onError(evt); };
    },
    onSignMessage(evt) {
      console.log('onSignMessage');
      const data = qs.parse(evt.data);
      if (data.status === 'success' && data.data) {
        this.signature = data.data.signature;
      }
      console.log(data);
      console.log(evt);
    },
    onError(evt) {
      console.log(evt);
    },
    onClose(evt) {
      console.log(evt);
    },
    onOpen(evt) {
      console.log(evt);
    },
    async getMessagePhrase() {
      const response = await axios.get('https://stats.runonflux.io/general/messagephrase');
      if (response.data.status === 'success') {
        return response.data.data;
      }
      vue.$customMes.error(response.data.data.message || response.data.data);
      return false;
    },
    async loadVotes() {
      if (this.zelid) {
        this.myNumberOfVotes = 0;
        const voteInformation = await this.getVoteInformation();
        if (voteInformation.status === 'success') {
          const votesInformantion = voteInformation.data;
          if (this.proposalDetail.status === 'Open' && (votesInformantion == null || votesInformantion.length === 0)) {
            await this.loadVotePower();
            this.haveVoted = false;
            this.dataToSign = await this.getMessagePhrase();
          } else {
            console.log('HERE');
            votesInformantion.forEach((vote) => {
              this.myNumberOfVotes += vote.numberOfVotes;
            });
            this.myVote = 'No';
            if (votesInformantion[0].vote) {
              this.myVote = 'Yes';
            }
            this.haveVoted = true;
          }
        } else {
          vue.$customMes.error(voteInformation.data.message || voteInformation.data);
        }
      }
    },
    async getVoteInformation() {
      const response = await axios.get(`https://stats.runonflux.io/proposals/voteInformation?hash=${this.proposalDetail.hash}&zelid=${this.zelid}`);
      return response.data;
    },
    async loadVotePower() {
      let url = `https://stats.runonflux.io/proposals/votepower?zelid=${this.zelid}`;
      if (this.proposalDetail.hash) {
        url = `https://stats.runonflux.io/proposals/votepower?zelid=${this.zelid}&hash=${this.proposalDetail.hash}`;
      }
      const responseApi = await axios.get(url);
      console.log(responseApi);
      if (responseApi.data.status === 'success') {
        this.myNumberOfVotes = responseApi.data.data.power;
      } else {
        vue.$customMes.error(responseApi.data.data.message || responseApi.data.data);
        this.myNumberOfVotes = 0;
      }
    },
    async register() {
      const data = {
        topic: this.proposalTopic,
        description: this.proposalDescription,
        grantValue: this.proposalGrantValue,
        grantAddress: this.proposalGrantAddress,
        nickName: this.proposalNickName,
      };
      const response = await axios.post('https://stats.runonflux.io/proposals/submitproposal', JSON.stringify(data));
      console.log(response);
      if (response.data.status === 'success') {
        this.foundationAddress = response.data.data.address;
        this.registrationHash = response.data.data.hash;
        this.proposalPrice = response.data.data.amount;
        this.validTill = response.data.data.paidTillDate;
      } else {
        vue.$customMes.error(response.data.data.message || response.data.data);
      }
    },
    async vote(myVote) {
      const data = {
        hash: this.proposalDetail.hash,
        zelid: this.zelid,
        message: this.dataToSign,
        signature: this.signature,
        vote: myVote,
      };
      console.log(data);
      const response = await axios.post('https://stats.runonflux.io/proposals/voteproposal', JSON.stringify(data));
      console.log(response);
      if (response.data.status === 'success') {
        vue.$customMes.success('Vote registered successful');
        this.myVote = 'No';
        if (myVote) {
          this.myVote = 'Yes';
        }
        this.haveVoted = true;
      } else {
        vue.$customMes.error(response.data.data.message || response.data.data);
      }
    },
  },
};
</script>
