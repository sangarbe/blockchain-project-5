pragma solidity >=0.4.21 <0.6.0;
pragma experimental ABIEncoderV2;

import "./ERC721Mintable.sol";
import "./SquareVerifier.sol";

contract SolnSquareVerifier is ERC721Mintable {

    event SolutionAdded(address to, uint256 tokenId, bytes32 proofHash);

    SquareVerifier private _verifier;

    struct Solution {
        address to;
        uint256 tokenId;
    }

    mapping(bytes32 => Solution) private _solutions;


    constructor (address verifierContract) ERC721Mintable(
        "Real State Homes",
        "RSH",
        "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/"
    ) public {
        _verifier = SquareVerifier(verifierContract);
    }

    function addSolution(address to, uint256 tokenId, bytes32 proofHash) internal {
        require(_solutions[proofHash].to == address(0), "SolnSquareVerifier: solution already used");

        _solutions[proofHash]= Solution({to: to, tokenId: tokenId});

        emit SolutionAdded(to, tokenId, proofHash);
    }

    function mint(address to, uint256 tokenId, SquareVerifier.Proof memory proof, uint[2] memory inputs) public {
        require(_verifier.verifyTx(proof, inputs), "SolnSquareVerifier: solution not verified");

        addSolution(to, tokenId, _getProofHash(proof, inputs));
        super.mint(to, tokenId, "");
    }

    function _getProofHash(SquareVerifier.Proof memory proof, uint[2] memory inputs) internal pure returns (bytes32)
    {
        return keccak256(abi.encode(proof.a, proof.b, proof.c, inputs));
    }
}


























