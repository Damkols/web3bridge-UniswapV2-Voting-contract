// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Voting {

    uint public counter = 0;

    struct Ballot {
        string question;
        string[] options;
        uint startTime;
        uint duration;
    }

    mapping(uint => Ballot) private _ballots;
    mapping(uint => mapping(uint => uint)) private _tally;
    mapping(uint => mapping(address => bool)) public hasVoted;

    function createBallot(
        string memory _question,
        string[] memory _options,
        uint _startTime,
        uint _duration
    ) external {
        require(_duration > 0, "Duration must be greater than 0");
        require(
            _startTime > block.timestamp,
            "Start time must be in the future"
        );
        require(_options.length >= 2, "Provide at minimum two options");
        _ballots[counter] = Ballot(_question, _options, _startTime, _duration);
        counter++;
    }

    function getBallotByIndex(
        uint _index
    ) external view returns (Ballot memory ballot) {
        ballot = _ballots[_index];
    }

    function cast(uint _ballotIndex, uint _optionIndex) external {
        require(
            !hasVoted[_ballotIndex][msg.sender],
            "Address already casted a vote for ballot"
        );
        Ballot memory ballot = _ballots[_ballotIndex];
        require(
            block.timestamp >= ballot.startTime,
            "Can't cast before start time"
        );
        require(
            block.timestamp < ballot.startTime + ballot.duration,
            "Can't cast after end time"
        );
        _tally[_ballotIndex][_optionIndex]++;
        hasVoted[_ballotIndex][msg.sender] = true;
    }

    function getTally(
        uint _ballotIndex,
        uint _optionIndex
    ) external view returns (uint) {
        return _tally[_ballotIndex][_optionIndex];
    }

    function results(uint _ballotIndex) external view returns (uint[] memory) {
        Ballot memory ballot = _ballots[_ballotIndex];
        uint len = ballot.options.length;
        uint[] memory result = new uint[](len);
        for (uint i = 0; i < len; i++) {
            result[i] = _tally[_ballotIndex][i];
        }
        return result;
    }

    function winners(uint _ballotIndex) external view returns (bool[] memory) {
        Ballot memory ballot = _ballots[_ballotIndex];
        uint len = ballot.options.length;
        uint[] memory result = new uint[](len);
        uint max;
        for (uint i = 0; i < len; i++) {
            result[i] = _tally[_ballotIndex][i];
            if (result[i] > max) {
                max = result[i];
            }
        }
        bool[] memory winner = new bool[](len);
        for (uint i = 0; i < len; i++) {
            if (result[i] == max) {
                winner[i] = true;
            }
        }
        return winner;
    }
}