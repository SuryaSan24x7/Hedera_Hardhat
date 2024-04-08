// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    address public owner;

    event ElectionCreated(uint indexed electionId, string name);
    event CandidateAdded(uint indexed electionId, uint indexed candidateId, string candidateName);
    event Voted(uint indexed electionId, uint indexed candidateId, address voter);

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    struct Election {
        uint id;
        string name;
        uint candidatesCount;
        mapping(uint => Candidate) candidates;
        mapping(address => bool) voters;
    }

    mapping(uint => Election) public elections;
    uint public electionsCount;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can perform this action.");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createElection(string memory _name) public onlyOwner {
        electionsCount++;
        Election storage election = elections[electionsCount];
        election.id = electionsCount;
        election.name = _name;
        emit ElectionCreated(electionsCount, _name);
    }

    function addCandidate(uint _electionId, string memory _candidateName) public onlyOwner {
        require(_electionId > 0 && _electionId <= electionsCount, "Election does not exist.");
        
        Election storage election = elections[_electionId];
        uint candidateId = ++election.candidatesCount;
        election.candidates[candidateId] = Candidate(candidateId, _candidateName, 0);

        emit CandidateAdded(_electionId, candidateId, _candidateName);
    }

    function vote(uint _electionId, uint _candidateId) public {
        require(_electionId > 0 && _electionId <= electionsCount, "Election does not exist.");
        require(_candidateId > 0 && _candidateId <= elections[_electionId].candidatesCount, "Invalid candidate.");
        require(!elections[_electionId].voters[msg.sender], "You have already voted in this election.");
        
        Election storage election = elections[_electionId];
        election.voters[msg.sender] = true;
        election.candidates[_candidateId].voteCount++;

        emit Voted(_electionId, _candidateId, msg.sender);
    }

    function getElectionDetails(uint _electionId) 
    public 
    view 
    returns (
        string memory name, 
        uint[] memory candidateIds, 
        string[] memory candidateNames, 
        uint[] memory candidateVoteCounts
    ) 
{
    require(_electionId > 0 && _electionId <= electionsCount, "Election does not exist.");
    Election storage election = elections[_electionId];
    
    uint candidateCount = election.candidatesCount;
    candidateIds = new uint[](candidateCount);
    candidateNames = new string[](candidateCount);
    candidateVoteCounts = new uint[](candidateCount);

    for (uint i = 1; i <= candidateCount; i++) {
        Candidate storage candidate = election.candidates[i];
        candidateIds[i - 1] = candidate.id;
        candidateNames[i - 1] = candidate.name;
        candidateVoteCounts[i - 1] = candidate.voteCount;
    }

    return (election.name, candidateIds, candidateNames, candidateVoteCounts);
}
}
