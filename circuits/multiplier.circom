pragma circom 2.1.3;

template Multiplier() {
    signal input in[3];

    signal output result;

    result <== in[0] * in[1];

    result === in[2];
}

component main = Multiplier();