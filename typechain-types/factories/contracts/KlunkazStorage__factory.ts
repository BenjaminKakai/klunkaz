/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../common";
import type {
  KlunkazStorage,
  KlunkazStorageInterface,
} from "../../contracts/KlunkazStorage";

const _abi = [
  {
    inputs: [],
    name: "bikeIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "reviewsCounter",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60806040523461001b575b60405161010e610029823961010e90f35b610023600080fd5b61000a56fe608060405260043610156016575b6014600080fd5b005b60003560e01c8063844ce5621460395763fbe7b21503600d57603560b6565b600d565b506035607c565b6000910312604a57565b6051600080fd5b565b605d916008021c81565b90565b90605d91546053565b605d600060016060565b90815260200190565b503460a2575b608b3660046040565b609e60936069565b604051918291826073565b0390f35b60a9600080fd5b6082565b605d6000806060565b503460cd575b60c53660046040565b609e609360ad565b60d4600080fd5b60bc56fea2646970667358221220c20b21edfabbe4acbfe2592848001d197af914de10cbc20b54d05234bb61947f64736f6c63430008110033";

type KlunkazStorageConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: KlunkazStorageConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class KlunkazStorage__factory extends ContractFactory {
  constructor(...args: KlunkazStorageConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      KlunkazStorage & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): KlunkazStorage__factory {
    return super.connect(runner) as KlunkazStorage__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): KlunkazStorageInterface {
    return new Interface(_abi) as KlunkazStorageInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): KlunkazStorage {
    return new Contract(address, _abi, runner) as unknown as KlunkazStorage;
  }
}
