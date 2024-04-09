// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract VotingSystemDemo{
    address public owner;
    uint256 public electionsCount = 0;

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    struct Election {
        uint id;
        string name;
        string uniqueCode;
        bool isEnded;
        uint candidatesCount;
        mapping(uint => Candidate) candidates;
        mapping(address => bool) hasVoted;
    }

    mapping(uint => Election) public elections;
    mapping(string => uint) private electionCodeToId;

    event ElectionCreated(uint indexed electionId, string name, string uniqueCode);
    event CandidateAdded(uint indexed electionId, uint indexed candidateId, string candidateName);
    event Voted(uint indexed electionId, uint indexed candidateId, address voter);
    event ElectionEnded(uint indexed electionId, string name);
    event ElectionResults(uint indexed electionId, uint[] candidateIds, string[] candidateNames, uint[] voteCounts);
    event ElectionWinner(uint indexed electionId, uint candidateId, string candidateName, uint voteCount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }

    modifier electionExists(uint electionId) {
        require(electionId > 0 && electionId <= electionsCount, "Election does not exist.");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createElection(string memory name, string memory uniqueCode) public onlyOwner {
        require(electionCodeToId[uniqueCode] == 0, "Election code must be unique.");

        electionsCount++;
        Election storage election = elections[electionsCount];
        election.id = electionsCount;
        election.name = name;
        election.uniqueCode = uniqueCode;
        election.isEnded = false;

        electionCodeToId[uniqueCode] = electionsCount;

        emit ElectionCreated(electionsCount, name, uniqueCode);
    }

    function addCandidate(uint electionId, string memory candidateName) public onlyOwner electionExists(electionId) {
        require(!elections[electionId].isEnded, "Election has already ended.");
        
        Election storage election = elections[electionId];
        uint candidateId = ++election.candidatesCount;
        election.candidates[candidateId] = Candidate(candidateId, candidateName, 0);

        emit CandidateAdded(electionId, candidateId, candidateName);
    }

    function vote(uint electionId, uint candidateId) public electionExists(electionId) {
        Election storage election = elections[electionId];
        require(!election.isEnded, "Election has already ended.");
        require(!election.hasVoted[msg.sender], "You have already voted.");
        require(candidateId > 0 && candidateId <= election.candidatesCount, "Invalid candidate.");

        election.hasVoted[msg.sender] = true;
        election.candidates[candidateId].voteCount++;

        emit Voted(electionId, candidateId, msg.sender);
    }

    function endElection(uint electionId) public onlyOwner electionExists(electionId) {
        Election storage election = elections[electionId];
        require(!election.isEnded, "Election has already ended.");

        election.isEnded = true;

        emit ElectionEnded(electionId, election.name);
    }


    function getElectionResults(uint electionId) public electionExists(electionId) returns (uint[] memory, string[] memory, uint[] memory, uint winnerCandidateId, string memory winnerCandidateName, uint winnerVoteCount) {
        Election storage election = elections[electionId];
        require(election.isEnded, "Election is not yet ended.");

        uint candidateCount = election.candidatesCount;
        uint[] memory ids = new uint[](candidateCount);
        string[] memory names = new string[](candidateCount);
        uint[] memory voteCounts = new uint[](candidateCount);

        uint highestVoteCount = 0;
        uint winningCandidateId = 0;

        for (uint i = 1; i <= candidateCount; i++) {
            Candidate storage candidate = election.candidates[i];
            ids[i - 1] = candidate.id;
            names[i - 1] = candidate.name;
            voteCounts[i - 1] = candidate.voteCount;

            // Determine the winner
            if (candidate.voteCount > highestVoteCount) {
                highestVoteCount = candidate.voteCount;
                winningCandidateId = i;
            }
        }

        require(winningCandidateId > 0, "No winner could be determined.");

        emit ElectionResults(electionId, ids, names, voteCounts);
        emit ElectionWinner(electionId, winningCandidateId, names[winningCandidateId - 1], highestVoteCount);
        return (ids, names, voteCounts, winningCandidateId, names[winningCandidateId - 1], highestVoteCount);
    }

}
