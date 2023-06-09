// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFT is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping(uint256 => string) private _tokenURIs;
    mapping(address => uint256[]) private _ownedTokens;
    mapping(address => Counters.Counter) private _ownedTokenCount;
    
    constructor(string memory tokenName, string memory symbol) ERC721(tokenName, symbol) {}
    
    function mintToken(address owner, string memory metadataURI) public returns (uint256) {
        _tokenIds.increment();
        uint256 id = _tokenIds.current();
        _safeMint(owner, id);
        _setTokenURI(id, metadataURI);
        
        _ownedTokens[owner].push(id);

        _ownedTokenCount[owner].increment();
        
        return id;
    }

    function _burn(uint256 tokenId) internal virtual override(ERC721) {
        super._burn(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    function tokenURI(uint256 tokenId) public view virtual override(ERC721) returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }
    
    function _setTokenURI(uint256 tokenId, string memory metadataURI) internal virtual {
        require(_exists(tokenId), "ERC721Metadata: URI set of nonexistent token");
        _tokenURIs[tokenId] = metadataURI;
    }

    function setTokenURI(uint256 tokenId, string memory metadataURI) public {
    require(_exists(tokenId), "ERC721Metadata: URI set of nonexistent token");
    _tokenURIs[tokenId] = metadataURI;
    }

    
    // function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256) {
    //     require(index < balanceOf(owner), "Index out of bounds");

    //     return _ownedTokens[owner][index];
    // }
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual {
        if (from != address(0)) {

            for(uint256 i = 0; i < _ownedTokenCount[from].current(); i++){
                if(_ownedTokens[from][i] == tokenId){
                    _ownedTokens[from][i] = _ownedTokens[from][_ownedTokenCount[from].current()-1];
                    _ownedTokens[from].pop();
                    break;
                }
            }
            
            _ownedTokenCount[from].decrement();
            
            if (from != to) {
                _ownedTokens[to].push(tokenId);
                _ownedTokenCount[to].increment();
            }
        }
    }

    function getTokenIdsOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = _ownedTokenCount[owner].current();
        uint256[] memory tokenIds = new uint256[](balance);

        for (uint256 i = 0; i < balance; i++) {
            tokenIds[i] = _ownedTokens[owner][i];
        }

        return tokenIds;
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        _beforeTokenTransfer(from, to, tokenId); // Call the custom function
        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        _beforeTokenTransfer(from, to, tokenId); // Call the custom function
        super.safeTransferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public virtual override {
        _beforeTokenTransfer(from, to, tokenId); // Call the custom function
        super.safeTransferFrom(from, to, tokenId, _data);
    }
}
