module question::nft {
    use sui::url::{Self, Url};
    use sui::object::{Self, ID, UID};
    use sui::event;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{utf8, String, Self};

    /// An example NFT that can be minted by anybody
    struct CertificateNFT has key, store {
        id: UID,
        /// Name for the token
        name: String,
        /// Description of the token
        description: String,
        /// URL for the token
        url: String,
    }

    // ===== Events =====

    struct NFTMinted has copy, drop {
        // The Object ID of the NFT
        object_id: ID,
        // The creator of the NFT
        creator: address,
        // The name of the NFT
        name: String,
    }

    // ===== Public view functions =====

    /// Get the NFT's `name`
    public fun name(nft: &CertificateNFT): &String {
        &nft.name
    }

    /// Get the NFT's `description`
    public fun description(nft: &CertificateNFT): &String {
        &nft.description
    }

    /// Get the NFT's `url`
    public fun url(nft: &CertificateNFT): &String {
        &nft.url
    }

    // ===== Entrypoints =====

    /// Create a new testnet_nft
    public entry fun mint_to_sender(
        name: String,
        description: String,
        url: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let nft = CertificateNFT {
            id: object::new(ctx),
            name: name,
            description: description,
            url: url,
        };

        event::emit(NFTMinted {
            object_id: object::id(&nft),
            creator: sender,
            name: nft.name,
        });

        transfer::public_transfer(nft, sender);
    }

    /// Transfer `nft` to `recipient`
    public entry fun transfer(
        nft: CertificateNFT, recipient: address, _: &mut TxContext
    ) {
        transfer::public_transfer(nft, recipient)
    }

    /// Update the `description` of `nft` to `new_description`
    public entry fun update_description(
        nft: &mut CertificateNFT,
        new_description: vector<u8>,
        _: &mut TxContext
    ) {
        nft.description = string::utf8(new_description)
    }

    /// Permanently delete `nft`
    public entry fun burn(nft: CertificateNFT, _: &mut TxContext) {
        let CertificateNFT { id, name: _, description: _, url: _ } = nft;
        object::delete(id)
    }
}

#[test_only]
module question::nft_test {
    use question::nft::{Self, CertificateNFT, mint_to_sender};
    use sui::test_scenario as ts;
    use sui::transfer;
    use std::string;

    #[test]
    fun mint_transfer_update() {
        let addr1 = @0xA;
        let addr2 = @0xB;
        // create the NFT
        let scenario = ts::begin(addr1);

        {
            mint_to_sender(
                "test",
                "a test",
                "https://www.sui.io",
                ts::ctx(&mut scenario)
            )
        };
        // send it from A to B
        ts::next_tx(&mut scenario, addr1);
        {
            let nft = ts::take_from_sender<CertificateNFT>(&mut scenario);
            transfer::public_transfer(nft, addr2);
        };
        // update its description
        ts::next_tx(&mut scenario, addr2);
        {
            let nft = ts::take_from_sender<CertificateNFT>(&mut scenario);
            nft::update_description(&mut nft, b"a new description", ts::ctx(&mut scenario));
            assert!(*string::bytes(nft::description(&nft)) == b"a new description", 0);
            ts::return_to_sender(&mut scenario, nft);
        };
        // burn it
        ts::next_tx(&mut scenario, addr2);
        {
            let nft = ts::take_from_sender<CertificateNFT>(&mut scenario);
            nft::burn(nft, ts::ctx(&mut scenario))
        };
        ts::end(scenario);
    }
}