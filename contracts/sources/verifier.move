module question::verifier {
    use sui::event;
    use sui::groth16::{Self, bn254};
    use sui::tx_context::{TxContext};
    use std::vector;
    use std::debug;
    use question::nft::{mint_to_sender};
    use std::string::{utf8, String, Self};

    struct VerifiedEvent has copy, drop {
        is_verified: bool,
    }

    const EIsNotVerified: u64 = 1;

    struct VerifyingKeyEvent has copy, drop {
        delta_bytes: vector<u8>,
        gamma_bytes: vector<u8>,
        alpha_bytes: vector<u8>,
        vk_bytes: vector<u8>,
    }

    struct JustEvent has copy, drop {
        vk_bytes: vector<u8>,
    }

    public entry fun verify_proof(
        vk: vector<u8>,
        public_inputs_bytes: vector<u8>,
        proof_points_bytes: vector<u8>
    ) {
        let pvk = groth16::prepare_verifying_key(&groth16::bn254(), &vk);
        let public_inputs = groth16::public_proof_inputs_from_bytes(public_inputs_bytes);
        let proof_points = groth16::proof_points_from_bytes(proof_points_bytes);
        let is_verified= groth16::verify_groth16_proof(
            &groth16::bn254(),
            &pvk,
            &public_inputs,
            &proof_points,
        );

        event::emit(VerifiedEvent {
            is_verified: is_verified,
        });
    }

    public entry fun issue_certificate(
        vk: vector<u8>,
        public_inputs_bytes: vector<u8>,
        proof_points_bytes: vector<u8>,
        name: String,
        description: String,
        url: String,
        ctx: &mut TxContext
    ) {
        let pvk = groth16::prepare_verifying_key(&groth16::bn254(), &vk);
        let public_inputs = groth16::public_proof_inputs_from_bytes(public_inputs_bytes);
        let proof_points = groth16::proof_points_from_bytes(proof_points_bytes);
        let is_verified= groth16::verify_groth16_proof(
            &groth16::bn254(),
            &pvk,
            &public_inputs,
            &proof_points,
        );

        event::emit(VerifiedEvent {
            is_verified: is_verified,
        });

        assert!(is_verified == true, EIsNotVerified);
        mint_to_sender(name, description, url, ctx);
    }

    public entry fun just(vk: vector<u8>) {
        use std::debug;
        debug::print(&vk);
        let arr = groth16::pvk_to_bytes(groth16::prepare_verifying_key(&bn254(), &vk));
        let delta_bytes = vector::pop_back(&mut arr);
        let gamma_bytes = vector::pop_back(&mut arr);
        let alpha_bytes = vector::pop_back(&mut arr);
        let vk_bytes = vector::pop_back(&mut arr);

        debug::print(&delta_bytes);
        debug::print(&gamma_bytes);
        debug::print(&alpha_bytes);
        debug::print(&vk_bytes);

        let expected_gamma_bytes = x"6030ca5b462a3502d560df7ff62b7f1215195233f688320de19e4b3a2a2cb6120ae49bcc0abbd3cbbf06b29b489edbf86e3b679f4e247464992145f468e3c00d";
        let expected_delta_bytes = x"b41e5e09002a7170cb4cc56ae96b152d17b6b0d1b9333b41f2325c3c8a9d2e2df98f8e2315884fae52b3c6bb329df0359daac4eff4d2e7ce729078b10d79d4af";
        let expected_alpha_bytes = x"61665b255f20b17bbd56b04a9e4d6bf596cb8d578ce5b2a9ccd498e26d394a3071485596cabce152f68889799f7f6b4e94d415c28e14a3aa609e389e344ae72778358ca908efe2349315bce79341c69623a14397b7fa47ae3fa31c6e41c2ee1b6ab50ef5434c1476d9894bc6afee68e0907b98aa8dfa3464cc9a122b247334064ff7615318b47b881cef4869f3dbfde38801475ae15244be1df58f55f71a5a01e28c8fa91fac886b97235fddb726dfc6a916483464ea130b6f82dc602e684b14f5ee655e510a0c1dd6f87b608718cd19d63a914f745a80c8016aa2c49883482aa28acd647cf9ce56446c0330fe6568bc03812b3bda44d804530abc67305f4914a509ecdc30f0b88b1a4a8b11e84856b333da3d86bb669a53dbfcde59511be60d8d5f7c79faa4910bf396ab04e7239d491e0a3bee177e6c9aac0ecbcd09ca850afcd46f25410849cefcfbdac828e7b057d4a732a373aad913d4b767897ba15d0bfcbcbb25bc5f2dae1ea59196ede9666a5c260f054b1a64977666af6a03076409";
        let expected_vk_bytes = x"1dcc52e058148a622c51acfdee6e181252ec0e9717653f0be1faaf2a68222e0dd2ccf4e1e8b088efccfdb955a1ff4a0fd28ae2ccbe1a112449ddae8738fb40b0";

        assert!(delta_bytes == expected_delta_bytes, 1003);
        assert!(gamma_bytes == expected_gamma_bytes, 1004);
        assert!(alpha_bytes == expected_alpha_bytes, 1005);
        assert!(vk_bytes == expected_vk_bytes, 1006);

        event::emit(VerifyingKeyEvent {
            delta_bytes: delta_bytes,
            gamma_bytes: gamma_bytes,
            alpha_bytes: alpha_bytes,
            vk_bytes: vk_bytes,
        });

        event::emit(JustEvent {
            vk_bytes: vk,
        });
    }

    public entry fun parse_pvk_from_vk(vk: vector<u8>) {
        use std::debug;
        debug::print(&vk);

        let arr = groth16::pvk_to_bytes(groth16::prepare_verifying_key(&bn254(), &vk));
        let delta_bytes = vector::pop_back(&mut arr);
        let gamma_bytes = vector::pop_back(&mut arr);
        let alpha_bytes = vector::pop_back(&mut arr);
        let vk_bytes = vector::pop_back(&mut arr);

        event::emit(VerifyingKeyEvent {
            delta_bytes: delta_bytes,
            gamma_bytes: gamma_bytes,
            alpha_bytes: alpha_bytes,
            vk_bytes: vk_bytes,
        })
    }

    public entry fun do_just() {
        let vk = x"53d75f472c207c7fcf6a34bc1e50cf0d7d2f983dd2230ffcaf280362d162c3871cae3e4f91b77eadaac316fe625e3764fb39af2bb5aa25007e9bc6b116f6f02f597ad7c28c4a33da5356e656dcef4660d7375973fe0d7b6dc642d51f16b6c8806030ca5b462a3502d560df7ff62b7f1215195233f688320de19e4b3a2a2cb6120ae49bcc0abbd3cbbf06b29b489edbf86e3b679f4e247464992145f468e3c08db41e5e09002a7170cb4cc56ae96b152d17b6b0d1b9333b41f2325c3c8a9d2e2df98f8e2315884fae52b3c6bb329df0359daac4eff4d2e7ce729078b10d79d42f02000000000000001dcc52e058148a622c51acfdee6e181252ec0e9717653f0be1faaf2a68222e0dd2ccf4e1e8b088efccfdb955a1ff4a0fd28ae2ccbe1a112449ddae8738fb40b0";
        just(vk);
    }

    public entry fun do_verify() {
        let vk_bytes = vector<u8>[
            16, 204, 235, 37, 166, 67, 209, 215, 249, 222, 89, 86, 67, 49, 153, 12, 63, 7, 107, 220, 100, 61, 121, 70, 149, 156, 248, 175, 203, 113, 7, 128, 15, 123, 214, 135, 70, 239, 233, 171, 198, 168, 174, 221, 134, 94, 254, 66, 226, 56, 57, 246, 82, 86, 213, 28, 142, 255, 112, 249, 120, 97, 58, 44, 88, 108, 71, 149, 149, 214, 68, 149, 238, 71, 14, 33, 182, 160, 200, 66, 170, 140, 70, 36, 174, 65, 8, 2, 31, 227, 78, 177, 55, 228, 74, 154, 40, 91, 76, 20, 139, 220, 217, 21, 221, 26, 200, 25, 41, 53, 166, 178, 203, 88, 39, 222, 203, 226, 225, 207, 203, 167, 187, 37, 200, 61, 117, 38, 234, 115, 231, 132, 31, 47, 49, 120, 200, 39, 205, 73, 255, 102, 178, 120, 36, 101, 203, 227, 180, 219, 146, 210, 235, 43, 109, 9, 218, 108, 144, 158, 97, 40, 17, 91, 212, 199, 81, 106, 108, 153, 174, 107, 193, 164, 22, 51, 10, 166, 26, 20, 159, 230, 241, 219, 130, 190, 215, 161, 89, 167, 201, 28, 242, 6, 64, 155, 176, 2, 195, 172, 58, 170, 186, 245, 95, 79, 2, 124, 237, 73, 28, 74, 20, 184, 150, 24, 225, 58, 80, 179, 137, 107, 251, 171, 2, 0, 0, 0, 0, 0, 0, 0, 117, 237, 227, 96, 2, 97, 59, 114, 180, 3, 157, 244, 89, 90, 19, 22, 192, 115, 255, 186, 155, 142, 153, 182, 2, 162, 45, 118, 30, 190, 177, 1, 246, 4, 195, 87, 255, 87, 106, 2, 126, 185, 0, 186, 186, 91, 4, 226, 211, 1, 35, 175, 238, 94, 217, 164, 129, 117, 250, 202, 230, 50, 105, 159
        ];
        let public_inputs_bytes = vector<u8>[
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
        ];
        let proof_points_bytes= vector<u8>[
            13, 84, 238, 7, 136, 181, 68, 169, 102, 148, 103, 106, 225, 56, 71, 140, 231, 5, 31, 11, 76, 237, 32, 18, 132, 67, 58, 151, 158, 53, 197, 150, 47, 158, 123, 135, 231, 163, 53, 227, 98, 89, 150, 7, 99, 216, 42, 104, 236, 199, 50, 129, 160, 39, 76, 38, 98, 179, 187, 82, 106, 218, 132, 44, 142, 249, 128, 218, 153, 226, 74, 211, 40, 211, 135, 217, 234, 11, 122, 171, 187, 222, 121, 254, 196, 48, 198, 203, 186, 145, 149, 250, 216, 226, 166, 165, 64, 22, 197, 134, 241, 247, 9, 137, 93, 103, 230, 154, 1, 26, 132, 24, 40, 57, 250, 253, 212, 180, 23, 5, 39, 134, 44, 176, 46, 139, 183, 14
        ];

        debug::print(&vk_bytes);
        debug::print(&public_inputs_bytes);
        debug::print(&proof_points_bytes);

        // u256 vector<u8>

        let pvk = groth16::prepare_verifying_key(&groth16::bn254(), &vk_bytes);
        let public_inputs = groth16::public_proof_inputs_from_bytes(public_inputs_bytes);
        let proof_points = groth16::proof_points_from_bytes(proof_points_bytes);
        let is_verified= groth16::verify_groth16_proof(&groth16::bn254(), &pvk, &public_inputs, &proof_points);
        debug::print(&is_verified);
    }

    #[test]
    public entry fun test_verify() {
        do_verify()
    }

    #[test]
    public entry fun test_just() {
        do_just()
    }

    #[test]
    fun test_prepare_verifying_key_bn254() {
        let vk = x"53d75f472c207c7fcf6a34bc1e50cf0d7d2f983dd2230ffcaf280362d162c3871cae3e4f91b77eadaac316fe625e3764fb39af2bb5aa25007e9bc6b116f6f02f597ad7c28c4a33da5356e656dcef4660d7375973fe0d7b6dc642d51f16b6c8806030ca5b462a3502d560df7ff62b7f1215195233f688320de19e4b3a2a2cb6120ae49bcc0abbd3cbbf06b29b489edbf86e3b679f4e247464992145f468e3c08db41e5e09002a7170cb4cc56ae96b152d17b6b0d1b9333b41f2325c3c8a9d2e2df98f8e2315884fae52b3c6bb329df0359daac4eff4d2e7ce729078b10d79d42f02000000000000001dcc52e058148a622c51acfdee6e181252ec0e9717653f0be1faaf2a68222e0dd2ccf4e1e8b088efccfdb955a1ff4a0fd28ae2ccbe1a112449ddae8738fb40b0";
        let arr = groth16::pvk_to_bytes(groth16::prepare_verifying_key(&bn254(), &vk));

        let expected_vk_bytes = x"1dcc52e058148a622c51acfdee6e181252ec0e9717653f0be1faaf2a68222e0dd2ccf4e1e8b088efccfdb955a1ff4a0fd28ae2ccbe1a112449ddae8738fb40b0";
        let expected_alpha_bytes = x"61665b255f20b17bbd56b04a9e4d6bf596cb8d578ce5b2a9ccd498e26d394a3071485596cabce152f68889799f7f6b4e94d415c28e14a3aa609e389e344ae72778358ca908efe2349315bce79341c69623a14397b7fa47ae3fa31c6e41c2ee1b6ab50ef5434c1476d9894bc6afee68e0907b98aa8dfa3464cc9a122b247334064ff7615318b47b881cef4869f3dbfde38801475ae15244be1df58f55f71a5a01e28c8fa91fac886b97235fddb726dfc6a916483464ea130b6f82dc602e684b14f5ee655e510a0c1dd6f87b608718cd19d63a914f745a80c8016aa2c49883482aa28acd647cf9ce56446c0330fe6568bc03812b3bda44d804530abc67305f4914a509ecdc30f0b88b1a4a8b11e84856b333da3d86bb669a53dbfcde59511be60d8d5f7c79faa4910bf396ab04e7239d491e0a3bee177e6c9aac0ecbcd09ca850afcd46f25410849cefcfbdac828e7b057d4a732a373aad913d4b767897ba15d0bfcbcbb25bc5f2dae1ea59196ede9666a5c260f054b1a64977666af6a03076409";
        let expected_gamma_bytes = x"6030ca5b462a3502d560df7ff62b7f1215195233f688320de19e4b3a2a2cb6120ae49bcc0abbd3cbbf06b29b489edbf86e3b679f4e247464992145f468e3c00d";
        let expected_delta_bytes = x"b41e5e09002a7170cb4cc56ae96b152d17b6b0d1b9333b41f2325c3c8a9d2e2df98f8e2315884fae52b3c6bb329df0359daac4eff4d2e7ce729078b10d79d4af";

        let delta_bytes = vector::pop_back(&mut arr);
        assert!(delta_bytes == expected_delta_bytes, 0);

        let gamma_bytes = vector::pop_back(&mut arr);
        assert!(gamma_bytes == expected_gamma_bytes, 0);

        let alpha_bytes = vector::pop_back(&mut arr);
        assert!(alpha_bytes == expected_alpha_bytes, 0);

        let vk_bytes = vector::pop_back(&mut arr);
        assert!(vk_bytes == expected_vk_bytes, 0);


        parse_pvk_from_vk(vk);
    }
}