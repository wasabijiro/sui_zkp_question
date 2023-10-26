use axum::{
    response::Json,
    routing::{get, post},
    Router,
};
use num_bigint::BigInt;
use num_traits::Num;
use serde::Deserialize;
use serde_json::json;
use std::time::{SystemTime, UNIX_EPOCH};
use std::{collections::HashMap, net::SocketAddr};
use tower_http::cors::{Any, CorsLayer};

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/get-proof-data", get(get_proof_data))
        .route("/generate-proof", post(generate_proof))
        .layer(
            CorsLayer::new()
                // .allow_methods(vec![http::Method::GET, http::Method::POST])
                // .allow_credentials(false
                .allow_origin(Any)
                .allow_headers(Any),
        );

    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}

async fn get_proof_data() -> impl axum::response::IntoResponse {
    let data = json!({
        "vk_bytes": "ada3c24e8c2e63579cc03fd1f112a093a17fc8ab0ff6eee7e04cab7bf8e03e7645381f309ec113309e05ac404c77ac7c8585d5e4328594f5a70a81f6bd4f29073883ee18fd90e2aa45d0fc7376e81e2fdf5351200386f5732e58eb6ff4d318dc",
        "inputs_bytes": "440758042e68b76a376f2fecf3a5a8105edb194c3e774e5a760140305aec8849",
        "proof_bytes": "a29981304df8e0f50750b558d4de59dbc8329634b81c986e28e9fff2b0faa52333b14a1f7b275b029e13499d1f5dd8ab955cf5fa3000a097920180381a238ce12df52207597eade4a365a6872c0a19a39c08a9bfb98b69a15615f90cc32660180ca32e565c01a49b505dd277713b1eae834df49643291a3601b11f56957bde02d5446406d0e4745d1bd32c8ccb8d8e80b877712f5f373016d2ecdeebb58caebc7a425b8137ebb1bd0c5b81c1d48151b25f0f24fe9602ba4e403811fb17db6f14"
    });

    Json(data)
}

#[derive(Deserialize, Debug)]
struct ProofRequest {
    input: Vec<i32>,
}

fn convert_to_input_map(request: &ProofRequest) -> HashMap<String, Vec<BigInt>> {
    let mut map = HashMap::new();

    // Convert the `input` array from the request to BigInt
    let input_bigints: Vec<BigInt> = request
        .input
        .iter()
        .map(|&num| BigInt::from(num))
        .collect();
    map.insert("input".to_string(), input_bigints);

    map
}

async fn generate_proof(
    body: axum::extract::Json<ProofRequest>,
) -> impl axum::response::IntoResponse {
    println!("Received request: {:?}", body);

    let prover_inputs = convert_to_input_map(&body);

    println!("Converted inputs: {:?}", prover_inputs);

    let (vk_bytes, public_inputs_bytes, proof_points_bytes) =
    prover::groth16::verify_proof_with_r1cs(
        prover_inputs,
        "../circuits/build/multiplier_js/multiplier.wasm",
        "../circuits/build/multiplier.r1cs",
    );

    println!("Verification successful, preparing response");

    println!("vk_bytes: {}", hex::encode(&vk_bytes));
    println!("public_inputs_bytes: {}", hex::encode(&public_inputs_bytes));
    println!("proof_points_bytes: {}", hex::encode(&proof_points_bytes));

    let response = json!({
        "vk": hex::encode(&vk_bytes),
        "public_inputs": hex::encode(&public_inputs_bytes),
        "proof_points": hex::encode(&proof_points_bytes),
    });

    println!("Response prepared: {:?}", response);

    Json(response)
}