// contracts/sources/vote.move
module question::vote {
    use std::string::{Self, String};
    use std::vector::{Self};

    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::vec_set::{Self, VecSet};

    fun init(ctx: &mut TxContext) {
    }

    struct Vote has key, store {
        id: UID,
        a: vector<address>,
        b: vector<address>,
    }

    public entry fun new_vote(ctx: &mut TxContext) {
        let vote = Vote {
            id: object::new(ctx),
            a: vector::empty(),
            b: vector::empty(),
        };
        transfer::share_object(vote);
    }

    public entry fun vote_a (vote: &mut Vote, ctx: &mut TxContext) {
        let len_a = vector::length(&vote.a);
        let len_b = vector::length(&vote.b);
        let i = 0;
        while (i < len_a) {
            let voted_address = vector::borrow(&vote.a, i);
            assert!(*voted_address != tx_context::sender(ctx), 1001);
            i = i + 1;
        };
        let j = 0;
        while (j < len_b) {
            let voted_address = vector::borrow(&vote.b, j);
            assert!(*voted_address != tx_context::sender(ctx), 1002);
            j = j + 1;
        };
        vector::push_back(&mut vote.a, tx_context::sender(ctx));
    }

    public entry fun vote_b (vote: &mut Vote, ctx: &mut TxContext) {
        vector::push_back(&mut vote.b, tx_context::sender(ctx));
    }

}
