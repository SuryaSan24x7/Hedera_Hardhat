const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");

describe("Voting", function () {
  async function deployVotingFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();

    return { voting, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { voting, owner } = await loadFixture(deployVotingFixture);

      expect(await voting.owner()).to.equal(owner.address);
    });
  });

  describe("Election Operations", function () {
    it("Should allow owner to create an election", async function () {
      const { voting, owner } = await loadFixture(deployVotingFixture);
      await expect(voting.createElection("Presidential Election 2024"))
        .to.emit(voting, "ElectionCreated")
        .withArgs(1, "Presidential Election 2024");

      // Optionally, check the election details are correctly set
      const electionDetails = await voting.elections(1);
      expect(electionDetails.name).to.equal("Presidential Election 2024");
    });

    it("Should allow owner to add a candidate to the election", async function () {
      const { voting } = await loadFixture(deployVotingFixture);
      await voting.createElection("Presidential Election 2024");
      await expect(voting.addCandidate(1, "Candidate 1"))
        .to.emit(voting, "CandidateAdded")
        .withArgs(1, 1, "Candidate 1");
    });

    it("Should allow users to vote", async function () {
      const { voting, otherAccount } = await loadFixture(deployVotingFixture);
      await voting.createElection("Presidential Election 2024");
      await voting.addCandidate(1, "Candidate 1");
      await expect(voting.connect(otherAccount).vote(1, 1))
        .to.emit(voting, "Voted")
        .withArgs(1, 1, otherAccount.address);
    });

    it("Should prevent double voting", async function () {
      const { voting, otherAccount } = await loadFixture(deployVotingFixture);
      await voting.createElection("Presidential Election 2024");
      await voting.addCandidate(1, "Candidate 1");
      await voting.connect(otherAccount).vote(1, 1); // First vote
      await expect(voting.connect(otherAccount).vote(1, 1))
        .to.be.revertedWith("You have already voted in this election.");
    });
  });

  
});

describe("Voting", function () {
  async function deployVotingFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();

    return { voting, owner, otherAccount };
  }

 

  describe("Election Operations 2", function () {
    it("Should allow owner to create an election", async function () {
      const { voting } = await loadFixture(deployVotingFixture);
      await expect(voting.createElection("Presidential Election 2024"))
        .to.emit(voting, "ElectionCreated")
        .withArgs(1, "Presidential Election 2024");
    });

    it("Should allow owner to add a candidate to the election", async function () {
      const { voting } = await loadFixture(deployVotingFixture);
      await voting.createElection("Presidential Election 2024");
      await expect(voting.addCandidate(1, "Candidate 1"))
        .to.emit(voting, "CandidateAdded")
        .withArgs(1, 1, "Candidate 1");
    });

    it("Should allow users to vote", async function () {
      const { voting, otherAccount } = await loadFixture(deployVotingFixture);
      await voting.createElection("Presidential Election 2024");
      await voting.addCandidate(1, "Candidate 1");
      await expect(voting.connect(otherAccount).vote(1, 1))
        .to.emit(voting, "Voted")
        .withArgs(1, 1, otherAccount.address);
    });

    it("Should prevent double voting", async function () {
      const { voting, otherAccount } = await loadFixture(deployVotingFixture);
      await voting.createElection("Presidential Election 2024");
      await voting.addCandidate(1, "Candidate 1");
      await voting.connect(otherAccount).vote(1, 1); // First vote
      await expect(voting.connect(otherAccount).vote(1, 1))
        .to.be.revertedWith("You have already voted in this election.");
    });

    it("Should not allow non-owner to create an election", async function () {
      const { voting, otherAccount } = await loadFixture(deployVotingFixture);
      await expect(voting.connect(otherAccount).createElection("Local Elections 2024"))
        .to.be.reverted; // Assuming some form of access control, adjust as necessary
    });

    it("Should not allow non-owner to add a candidate", async function () {
      const { voting, otherAccount } = await loadFixture(deployVotingFixture);
      await voting.createElection("Local Elections 2024");
      await expect(voting.connect(otherAccount).addCandidate(1, "Candidate 2"))
        .to.be.reverted; // Assuming some form of access control, adjust as necessary
    });

    // Assuming a function to check the election results exists
    it("Should tally votes correctly", async function () {
      const { voting, owner, otherAccount } = await loadFixture(deployVotingFixture);
      await voting.createElection("Presidential Election 2024");
      await voting.addCandidate(1, "Candidate 1");
      await voting.connect(otherAccount).vote(1, 1);

      // Assuming a function to get election results exists
      const results = await voting.getElectionDetails(1);
      
      expect(Number(results[3])).to.equal(1); // Adjust according to how results are returned
    });
  });

});
// Additional Negative Testing

describe("Negative Cases", function () {
    async function deployVotingFixture() {
      const [owner, otherAccount] = await ethers.getSigners();
      const Voting = await ethers.getContractFactory("Voting");
      const voting = await Voting.deploy();
      return { voting, owner, otherAccount };
    }
  
    describe("Invalid Operations", function () {
      it("Should not allow adding a candidate to a non-existent election", async function () {
        const { voting } = await loadFixture(deployVotingFixture);
        // Trying to add a candidate to an election that doesn't exist (id: 999)
        await expect(voting.addCandidate(999, "Candidate X"))
          .to.be.revertedWith("Election does not exist.");
      });
  
      it("Should not allow voting in a non-existent election", async function () {
        const { voting, otherAccount } = await loadFixture(deployVotingFixture);
        // Trying to vote in an election that doesn't exist (id: 999)
        await expect(voting.connect(otherAccount).vote(999, 1))
          .to.be.revertedWith("Election does not exist.");
      });
  
      it("Should not allow creating an election with invalid parameters", async function () {
        const { voting } = await loadFixture(deployVotingFixture);
        // Assuming the contract has validation for election names
        await expect(voting.createElection(""))
          .to.be.revertedWith("Invalid election name.");
      });
  
      it("Should not allow adding a candidate with invalid parameters", async function () {
        const { voting } = await loadFixture(deployVotingFixture);
        await voting.createElection("Test Election");
        // Assuming the contract has validation for candidate names
        await expect(voting.addCandidate(1, ""))
          .to.be.revertedWith("Invalid candidate name.");
      });
  
      it("Should enforce access control on sensitive functions", async function () {
        const { voting, otherAccount } = await loadFixture(deployVotingFixture);
        // Assuming only the owner can reset election results
        await expect(voting.connect(otherAccount).resetElection(1))
          .to.be.revertedWith("Unauthorized.");
      });
  
      // Assuming there's a limit to the number of candidates per election
      it("Should enforce candidate limit per election", async function () {
        const { voting } = await loadFixture(deployVotingFixture);
        await voting.createElection("Test Election");
        const MAX_CANDIDATES = 5; // Assuming a max of 5 candidates for demonstration
        for (let i = 1; i <= MAX_CANDIDATES; i++) {
          await voting.addCandidate(1, `Candidate ${i}`);
        }
        await expect(voting.addCandidate(1, "Candidate 6"))
          .to.be.revertedWith("Candidate limit reached.");
      });
  
      // Assuming there's a deadline for voting
      it("Should not allow voting after the deadline", async function () {
        const { voting, otherAccount } = await loadFixture(deployVotingFixture);
        await voting.createElection("Test Election");
        await voting.addCandidate(1, "Candidate 1");
        // Simulate passing of the deadline (e.g., by manipulating block timestamp in test environment)
        // This would require the test environment to support time manipulation, such as Hardhat's network.provider.send
        await network.provider.send("evm_increaseTime", [86400 * 30]); // 30 days
        await expect(voting.connect(otherAccount).vote(1, 1))
          .to.be.revertedWith("Voting period has ended.");
      });
    });
  });
  

