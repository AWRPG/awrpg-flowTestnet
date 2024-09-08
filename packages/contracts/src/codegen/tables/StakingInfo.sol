// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/* Autogenerated file. Do not edit manually. */

// Import store internals
import { IStore } from "@latticexyz/store/src/IStore.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { Bytes } from "@latticexyz/store/src/Bytes.sol";
import { Memory } from "@latticexyz/store/src/Memory.sol";
import { SliceLib } from "@latticexyz/store/src/Slice.sol";
import { EncodeArray } from "@latticexyz/store/src/tightcoder/EncodeArray.sol";
import { FieldLayout } from "@latticexyz/store/src/FieldLayout.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";
import { EncodedLengths, EncodedLengthsLib } from "@latticexyz/store/src/EncodedLengths.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

struct StakingInfoData {
  bytes32 role;
  bytes32 building;
  uint40 lastUpdated;
}

library StakingInfo {
  // Hex below is the result of `WorldResourceIdLib.encode({ namespace: "", name: "StakingInfo", typeId: RESOURCE_TABLE });`
  ResourceId constant _tableId = ResourceId.wrap(0x746200000000000000000000000000005374616b696e67496e666f0000000000);

  FieldLayout constant _fieldLayout =
    FieldLayout.wrap(0x0045030020200500000000000000000000000000000000000000000000000000);

  // Hex-encoded key schema of (bytes32)
  Schema constant _keySchema = Schema.wrap(0x002001005f000000000000000000000000000000000000000000000000000000);
  // Hex-encoded value schema of (bytes32, bytes32, uint40)
  Schema constant _valueSchema = Schema.wrap(0x004503005f5f0400000000000000000000000000000000000000000000000000);

  /**
   * @notice Get the table's key field names.
   * @return keyNames An array of strings with the names of key fields.
   */
  function getKeyNames() internal pure returns (string[] memory keyNames) {
    keyNames = new string[](1);
    keyNames[0] = "stakingId";
  }

  /**
   * @notice Get the table's value field names.
   * @return fieldNames An array of strings with the names of value fields.
   */
  function getFieldNames() internal pure returns (string[] memory fieldNames) {
    fieldNames = new string[](3);
    fieldNames[0] = "role";
    fieldNames[1] = "building";
    fieldNames[2] = "lastUpdated";
  }

  /**
   * @notice Register the table with its config.
   */
  function register() internal {
    StoreSwitch.registerTable(_tableId, _fieldLayout, _keySchema, _valueSchema, getKeyNames(), getFieldNames());
  }

  /**
   * @notice Register the table with its config.
   */
  function _register() internal {
    StoreCore.registerTable(_tableId, _fieldLayout, _keySchema, _valueSchema, getKeyNames(), getFieldNames());
  }

  /**
   * @notice Get role.
   */
  function getRole(bytes32 stakingId) internal view returns (bytes32 role) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = stakingId;

    bytes32 _blob = StoreSwitch.getStaticField(_tableId, _keyTuple, 0, _fieldLayout);
    return (bytes32(_blob));
  }

  /**
   * @notice Get role.
   */
  function _getRole(bytes32 stakingId) internal view returns (bytes32 role) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = stakingId;

    bytes32 _blob = StoreCore.getStaticField(_tableId, _keyTuple, 0, _fieldLayout);
    return (bytes32(_blob));
  }

  /**
   * @notice Set role.
   */
  function setRole(bytes32 stakingId, bytes32 role) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = stakingId;

    StoreSwitch.setStaticField(_tableId, _keyTuple, 0, abi.encodePacked((role)), _fieldLayout);
  }

  /**
   * @notice Set role.
   */
  function _setRole(bytes32 stakingId, bytes32 role) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = stakingId;

    StoreCore.setStaticField(_tableId, _keyTuple, 0, abi.encodePacked((role)), _fieldLayout);
  }

  /**
   * @notice Get building.
   */
  function getBuilding(bytes32 stakingId) internal view returns (bytes32 building) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = stakingId;

    bytes32 _blob = StoreSwitch.getStaticField(_tableId, _keyTuple, 1, _fieldLayout);
    return (bytes32(_blob));
  }

  /**
   * @notice Get building.
   */
  function _getBuilding(bytes32 stakingId) internal view returns (bytes32 building) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = stakingId;

    bytes32 _blob = StoreCore.getStaticField(_tableId, _keyTuple, 1, _fieldLayout);
    return (bytes32(_blob));
  }

  /**
   * @notice Set building.
   */
  function setBuilding(bytes32 stakingId, bytes32 building) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = stakingId;

    StoreSwitch.setStaticField(_tableId, _keyTuple, 1, abi.encodePacked((building)), _fieldLayout);
  }

  /**
   * @notice Set building.
   */
  function _setBuilding(bytes32 stakingId, bytes32 building) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = stakingId;

    StoreCore.setStaticField(_tableId, _keyTuple, 1, abi.encodePacked((building)), _fieldLayout);
  }

  /**
   * @notice Get lastUpdated.
   */
  function getLastUpdated(bytes32 stakingId) internal view returns (uint40 lastUpdated) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = stakingId;

    bytes32 _blob = StoreSwitch.getStaticField(_tableId, _keyTuple, 2, _fieldLayout);
    return (uint40(bytes5(_blob)));
  }

  /**
   * @notice Get lastUpdated.
   */
  function _getLastUpdated(bytes32 stakingId) internal view returns (uint40 lastUpdated) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = stakingId;

    bytes32 _blob = StoreCore.getStaticField(_tableId, _keyTuple, 2, _fieldLayout);
    return (uint40(bytes5(_blob)));
  }

  /**
   * @notice Set lastUpdated.
   */
  function setLastUpdated(bytes32 stakingId, uint40 lastUpdated) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = stakingId;

    StoreSwitch.setStaticField(_tableId, _keyTuple, 2, abi.encodePacked((lastUpdated)), _fieldLayout);
  }

  /**
   * @notice Set lastUpdated.
   */
  function _setLastUpdated(bytes32 stakingId, uint40 lastUpdated) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = stakingId;

    StoreCore.setStaticField(_tableId, _keyTuple, 2, abi.encodePacked((lastUpdated)), _fieldLayout);
  }

  /**
   * @notice Get the full data.
   */
  function get(bytes32 stakingId) internal view returns (StakingInfoData memory _table) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = stakingId;

    (bytes memory _staticData, EncodedLengths _encodedLengths, bytes memory _dynamicData) = StoreSwitch.getRecord(
      _tableId,
      _keyTuple,
      _fieldLayout
    );
    return decode(_staticData, _encodedLengths, _dynamicData);
  }

  /**
   * @notice Get the full data.
   */
  function _get(bytes32 stakingId) internal view returns (StakingInfoData memory _table) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = stakingId;

    (bytes memory _staticData, EncodedLengths _encodedLengths, bytes memory _dynamicData) = StoreCore.getRecord(
      _tableId,
      _keyTuple,
      _fieldLayout
    );
    return decode(_staticData, _encodedLengths, _dynamicData);
  }

  /**
   * @notice Set the full data using individual values.
   */
  function set(bytes32 stakingId, bytes32 role, bytes32 building, uint40 lastUpdated) internal {
    bytes memory _staticData = encodeStatic(role, building, lastUpdated);

    EncodedLengths _encodedLengths;
    bytes memory _dynamicData;

    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = stakingId;

    StoreSwitch.setRecord(_tableId, _keyTuple, _staticData, _encodedLengths, _dynamicData);
  }

  /**
   * @notice Set the full data using individual values.
   */
  function _set(bytes32 stakingId, bytes32 role, bytes32 building, uint40 lastUpdated) internal {
    bytes memory _staticData = encodeStatic(role, building, lastUpdated);

    EncodedLengths _encodedLengths;
    bytes memory _dynamicData;

    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = stakingId;

    StoreCore.setRecord(_tableId, _keyTuple, _staticData, _encodedLengths, _dynamicData, _fieldLayout);
  }

  /**
   * @notice Set the full data using the data struct.
   */
  function set(bytes32 stakingId, StakingInfoData memory _table) internal {
    bytes memory _staticData = encodeStatic(_table.role, _table.building, _table.lastUpdated);

    EncodedLengths _encodedLengths;
    bytes memory _dynamicData;

    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = stakingId;

    StoreSwitch.setRecord(_tableId, _keyTuple, _staticData, _encodedLengths, _dynamicData);
  }

  /**
   * @notice Set the full data using the data struct.
   */
  function _set(bytes32 stakingId, StakingInfoData memory _table) internal {
    bytes memory _staticData = encodeStatic(_table.role, _table.building, _table.lastUpdated);

    EncodedLengths _encodedLengths;
    bytes memory _dynamicData;

    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = stakingId;

    StoreCore.setRecord(_tableId, _keyTuple, _staticData, _encodedLengths, _dynamicData, _fieldLayout);
  }

  /**
   * @notice Decode the tightly packed blob of static data using this table's field layout.
   */
  function decodeStatic(bytes memory _blob) internal pure returns (bytes32 role, bytes32 building, uint40 lastUpdated) {
    role = (Bytes.getBytes32(_blob, 0));

    building = (Bytes.getBytes32(_blob, 32));

    lastUpdated = (uint40(Bytes.getBytes5(_blob, 64)));
  }

  /**
   * @notice Decode the tightly packed blobs using this table's field layout.
   * @param _staticData Tightly packed static fields.
   *
   *
   */
  function decode(
    bytes memory _staticData,
    EncodedLengths,
    bytes memory
  ) internal pure returns (StakingInfoData memory _table) {
    (_table.role, _table.building, _table.lastUpdated) = decodeStatic(_staticData);
  }

  /**
   * @notice Delete all data for given keys.
   */
  function deleteRecord(bytes32 stakingId) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = stakingId;

    StoreSwitch.deleteRecord(_tableId, _keyTuple);
  }

  /**
   * @notice Delete all data for given keys.
   */
  function _deleteRecord(bytes32 stakingId) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = stakingId;

    StoreCore.deleteRecord(_tableId, _keyTuple, _fieldLayout);
  }

  /**
   * @notice Tightly pack static (fixed length) data using this table's schema.
   * @return The static data, encoded into a sequence of bytes.
   */
  function encodeStatic(bytes32 role, bytes32 building, uint40 lastUpdated) internal pure returns (bytes memory) {
    return abi.encodePacked(role, building, lastUpdated);
  }

  /**
   * @notice Encode all of a record's fields.
   * @return The static (fixed length) data, encoded into a sequence of bytes.
   * @return The lengths of the dynamic fields (packed into a single bytes32 value).
   * @return The dynamic (variable length) data, encoded into a sequence of bytes.
   */
  function encode(
    bytes32 role,
    bytes32 building,
    uint40 lastUpdated
  ) internal pure returns (bytes memory, EncodedLengths, bytes memory) {
    bytes memory _staticData = encodeStatic(role, building, lastUpdated);

    EncodedLengths _encodedLengths;
    bytes memory _dynamicData;

    return (_staticData, _encodedLengths, _dynamicData);
  }

  /**
   * @notice Encode keys as a bytes32 array using this table's field layout.
   */
  function encodeKeyTuple(bytes32 stakingId) internal pure returns (bytes32[] memory) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = stakingId;

    return _keyTuple;
  }
}