/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/zoot.json`.
 */
export type Zoot = {
  "address": "7uoPeW7BaCABZ6dG8fDaekVBfYuLsod3yRbS253wVVNY",
  "metadata": {
    "name": "zoot",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "buyTokenWithSol",
      "discriminator": [
        158,
        168,
        23,
        217,
        217,
        106,
        94,
        73
      ],
      "accounts": [
        {
          "name": "presaleInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  80,
                  82,
                  69,
                  83,
                  65,
                  76,
                  69,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              }
            ]
          }
        },
        {
          "name": "tokenMint",
          "writable": true,
          "relations": [
            "presaleInfo"
          ]
        },
        {
          "name": "presaleAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "presaleInfo"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "userInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  85,
                  83,
                  69,
                  82,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              },
              {
                "kind": "account",
                "path": "buyer"
              }
            ]
          }
        },
        {
          "name": "presaleVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  80,
                  82,
                  69,
                  83,
                  65,
                  76,
                  69,
                  95,
                  86,
                  65,
                  85,
                  76,
                  84
                ]
              }
            ]
          }
        },
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "solAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "changeMode",
      "discriminator": [
        124,
        163,
        122,
        208,
        67,
        22,
        162,
        241
      ],
      "accounts": [
        {
          "name": "presaleInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  80,
                  82,
                  69,
                  83,
                  65,
                  76,
                  69,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "value",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claimToken",
      "discriminator": [
        116,
        206,
        27,
        191,
        166,
        19,
        0,
        73
      ],
      "accounts": [
        {
          "name": "presaleInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  80,
                  82,
                  69,
                  83,
                  65,
                  76,
                  69,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              }
            ]
          }
        },
        {
          "name": "tokenMint",
          "writable": true,
          "relations": [
            "presaleInfo"
          ]
        },
        {
          "name": "buyerAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "buyer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "presaleVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  80,
                  82,
                  69,
                  83,
                  65,
                  76,
                  69,
                  95,
                  86,
                  65,
                  85,
                  76,
                  84
                ]
              }
            ]
          }
        },
        {
          "name": "userInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  85,
                  83,
                  69,
                  82,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              },
              {
                "kind": "account",
                "path": "buyer"
              }
            ]
          }
        },
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": []
    },
    {
      "name": "createPresale",
      "discriminator": [
        176,
        144,
        197,
        158,
        61,
        119,
        75,
        135
      ],
      "accounts": [
        {
          "name": "presaleInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  80,
                  82,
                  69,
                  83,
                  65,
                  76,
                  69,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              }
            ]
          }
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "presaleAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "presaleInfo"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "presaleVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  80,
                  82,
                  69,
                  83,
                  65,
                  76,
                  69,
                  95,
                  86,
                  65,
                  85,
                  76,
                  84
                ]
              }
            ]
          }
        },
        {
          "name": "vestingTokenVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "presaleVault"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "rewardVaultInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  82,
                  69,
                  87,
                  65,
                  82,
                  68,
                  95,
                  86,
                  65,
                  85,
                  76,
                  84,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              }
            ]
          }
        },
        {
          "name": "rewardTokenVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "rewardVaultInfo"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "softCap",
          "type": "u64"
        },
        {
          "name": "hardCap",
          "type": "u64"
        },
        {
          "name": "maxTokenPerUser",
          "type": "u64"
        },
        {
          "name": "maxTokenPerEveryDay",
          "type": "u64"
        },
        {
          "name": "seedPrice",
          "type": "u64"
        },
        {
          "name": "privatePrice",
          "type": "u64"
        },
        {
          "name": "publicPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "depositToken",
      "discriminator": [
        11,
        156,
        96,
        218,
        39,
        163,
        180,
        19
      ],
      "accounts": [
        {
          "name": "tokenMint",
          "docs": [
            "The mint used for presale. Already created in create_presale."
          ],
          "relations": [
            "presaleInfo"
          ]
        },
        {
          "name": "presaleInfo",
          "docs": [
            "The presale info PDA, created in create_presale."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  80,
                  82,
                  69,
                  83,
                  65,
                  76,
                  69,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              }
            ]
          }
        },
        {
          "name": "adminAta",
          "docs": [
            "Admin’s associated token account (already exists or can be created)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "admin"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "presaleAta",
          "docs": [
            "Presale ATA created in create_presale. Just load & mutate."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "presaleInfo"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "presaleVault",
          "docs": [
            "Presale vault PDA (SOL vault), already created in create_presale."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  80,
                  82,
                  69,
                  83,
                  65,
                  76,
                  69,
                  95,
                  86,
                  65,
                  85,
                  76,
                  84
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "disableClaim",
      "discriminator": [
        46,
        152,
        57,
        91,
        32,
        212,
        198,
        162
      ],
      "accounts": [
        {
          "name": "presaleInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  80,
                  82,
                  69,
                  83,
                  65,
                  76,
                  69,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "enableClaim",
      "discriminator": [
        12,
        41,
        234,
        39,
        49,
        229,
        221,
        169
      ],
      "accounts": [
        {
          "name": "presaleInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  80,
                  82,
                  69,
                  83,
                  65,
                  76,
                  69,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "refer",
      "discriminator": [
        209,
        57,
        82,
        52,
        95,
        105,
        131,
        119
      ],
      "accounts": [
        {
          "name": "userInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  85,
                  83,
                  69,
                  82,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "docs": [
            "The user who is signing up"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "docs": [
            "Existing user info account for direct referrer",
            "System program for account creation"
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "startPresale",
      "discriminator": [
        57,
        19,
        73,
        191,
        195,
        254,
        45,
        223
      ],
      "accounts": [
        {
          "name": "presaleInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  80,
                  82,
                  69,
                  83,
                  65,
                  76,
                  69,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "startTime",
          "type": "u64"
        },
        {
          "name": "endTime",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updatePresale",
      "discriminator": [
        9,
        223,
        20,
        184,
        183,
        199,
        90,
        226
      ],
      "accounts": [
        {
          "name": "presaleInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  80,
                  82,
                  69,
                  83,
                  65,
                  76,
                  69,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "fieldType",
          "type": {
            "defined": {
              "name": "presaleField"
            }
          }
        },
        {
          "name": "value",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawSol",
      "discriminator": [
        145,
        131,
        74,
        136,
        65,
        137,
        42,
        38
      ],
      "accounts": [
        {
          "name": "presaleInfo",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  80,
                  82,
                  69,
                  83,
                  65,
                  76,
                  69,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              }
            ]
          }
        },
        {
          "name": "presaleVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  80,
                  82,
                  69,
                  83,
                  65,
                  76,
                  69,
                  95,
                  86,
                  65,
                  85,
                  76,
                  84
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "withdrawToken",
      "discriminator": [
        136,
        235,
        181,
        5,
        101,
        109,
        57,
        81
      ],
      "accounts": [
        {
          "name": "presaleInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  80,
                  82,
                  69,
                  83,
                  65,
                  76,
                  69,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              }
            ]
          }
        },
        {
          "name": "adminAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "presaleTokenVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "presaleInfo"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenMint",
          "relations": [
            "presaleInfo"
          ]
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "presaleInfo",
      "discriminator": [
        11,
        19,
        36,
        47,
        79,
        104,
        214,
        40
      ]
    },
    {
      "name": "rewardVault",
      "discriminator": [
        201,
        22,
        221,
        167,
        208,
        16,
        210,
        33
      ]
    },
    {
      "name": "userInfo",
      "discriminator": [
        83,
        134,
        200,
        56,
        144,
        56,
        10,
        62
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "alreadyInitialized",
      "msg": "Presale Already Initialized"
    },
    {
      "code": 6001,
      "name": "invalidUserType",
      "msg": "Presale user type not invalid"
    },
    {
      "code": 6002,
      "name": "presaleNotStarted",
      "msg": "PresaleNot Started"
    },
    {
      "code": 6003,
      "name": "presaleEnded",
      "msg": "Presale Finished"
    },
    {
      "code": 6004,
      "name": "presaleNotLive",
      "msg": "Presale is not enabled"
    },
    {
      "code": 6005,
      "name": "insufficientFund",
      "msg": "token not enough"
    },
    {
      "code": 6006,
      "name": "exceededDailyLimit",
      "msg": "today sol is selled enough"
    },
    {
      "code": 6007,
      "name": "hardCapped",
      "msg": "token is hard capped"
    },
    {
      "code": 6008,
      "name": "presaleNotEnded",
      "msg": "presale note ended"
    },
    {
      "code": 6009,
      "name": "invalidTokenMint",
      "msg": "fake token mint "
    }
  ],
  "types": [
    {
      "name": "presaleField",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "softCap"
          },
          {
            "name": "hardCap"
          },
          {
            "name": "maxTokenLimitPerDay"
          },
          {
            "name": "maxTokenLimitPerUser"
          },
          {
            "name": "startTs"
          },
          {
            "name": "endTs"
          },
          {
            "name": "seedPrice"
          },
          {
            "name": "privatePrice"
          },
          {
            "name": "publicPrice"
          },
          {
            "name": "totalSellAmount"
          },
          {
            "name": "isEnable"
          },
          {
            "name": "claimEnable"
          },
          {
            "name": "phaseName"
          }
        ]
      }
    },
    {
      "name": "presaleInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "init",
            "type": "bool"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "softCap",
            "type": "u64"
          },
          {
            "name": "hardCap",
            "type": "u64"
          },
          {
            "name": "maxTokenLimitPerDay",
            "type": "u64"
          },
          {
            "name": "maxTokenLimitPerUser",
            "type": "u64"
          },
          {
            "name": "startTs",
            "type": "u64"
          },
          {
            "name": "endTs",
            "type": "u64"
          },
          {
            "name": "seedPrice",
            "type": "u64"
          },
          {
            "name": "privatePrice",
            "type": "u64"
          },
          {
            "name": "publicPrice",
            "type": "u64"
          },
          {
            "name": "totalSellAmount",
            "type": "u64"
          },
          {
            "name": "isEnable",
            "type": "bool"
          },
          {
            "name": "claimEnable",
            "type": "bool"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "presaleStage",
            "type": "u64"
          },
          {
            "name": "totalDepositToken",
            "type": "u64"
          },
          {
            "name": "isHardCap",
            "type": "bool"
          },
          {
            "name": "isSoftCap",
            "type": "bool"
          },
          {
            "name": "totalStakedSol",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "rewardVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "totalRewardedAmount",
            "type": "u64"
          },
          {
            "name": "totalDirectReward",
            "type": "u64"
          },
          {
            "name": "totalSecondReward",
            "type": "u64"
          },
          {
            "name": "totalThirdReward",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "userInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stakedSol",
            "type": "u64"
          },
          {
            "name": "tokenAmount",
            "type": "u64"
          },
          {
            "name": "buyCount",
            "type": "u64"
          },
          {
            "name": "dayToken",
            "type": "u64"
          },
          {
            "name": "lastBuyTime",
            "type": "u64"
          },
          {
            "name": "createTime",
            "type": "i64"
          },
          {
            "name": "claimedAmount",
            "type": "u64"
          },
          {
            "name": "lastClaimTimestamp",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "presaleSeed",
      "type": "bytes",
      "value": "[80, 82, 69, 83, 65, 76, 69, 95, 83, 69, 69, 68]"
    }
  ]
};
