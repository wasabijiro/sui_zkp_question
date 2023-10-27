pub use ark_bn254::{Bn254 as Curve, Fr};
use ark_serialize::CanonicalSerialize;
use num_bigint::BigInt;
use num_traits::Num;
use serde_json::Value;
use std::collections::HashMap;
use std::fs;

pub fn load_public_inputs_from_file(file_path: &str) -> HashMap<String, Vec<BigInt>> {
    let data = fs::read_to_string(file_path).expect("Unable to read file");
    let inputs: Value = serde_json::from_str(&data).expect("JSON was not well-formatted");
    let mut map = HashMap::new();

    if let Value::Object(entries) = inputs {
        for (key, value) in entries {
            if let Value::Array(arr) = value {
                let bigints: Vec<BigInt> = arr.iter().filter_map(|v| {
                    if let Value::Number(num) = v {
                        Some(BigInt::from(num.as_i64().unwrap()))
                    } else {
                        None
                    }
                }).collect();
                map.insert(key, bigints);
            }
        }
    }

    map
}

pub fn serialize_to_bytes<T: CanonicalSerialize>(data: &T) -> Vec<u8> {
    let mut bytes = vec![];
    data.serialize_compressed(&mut bytes).unwrap();
    bytes
}
