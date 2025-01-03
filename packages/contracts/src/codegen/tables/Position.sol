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

struct PositionData {
  uint32 x;
  uint32 y;
}

library Position {
  // Hex below is the result of `WorldResourceIdLib.encode({ namespace: "", name: "Position", typeId: RESOURCE_TABLE });`
  ResourceId constant _tableId = ResourceId.wrap(0x74620000000000000000000000000000506f736974696f6e0000000000000000);

  FieldLayout constant _fieldLayout =
    FieldLayout.wrap(0x0008020004040000000000000000000000000000000000000000000000000000);

  // Hex-encoded key schema of (bytes32)
  Schema constant _keySchema = Schema.wrap(0x002001005f000000000000000000000000000000000000000000000000000000);
  // Hex-encoded value schema of (uint32, uint32)
  Schema constant _valueSchema = Schema.wrap(0x0008020003030000000000000000000000000000000000000000000000000000);

  /**
   * @notice Get the table's key field names.
   * @return keyNames An array of strings with the names of key fields.
   */
  function getKeyNames() internal pure returns (string[] memory keyNames) {
    keyNames = new string[](1);
    keyNames[0] = "entityId";
  }

  /**
   * @notice Get the table's value field names.
   * @return fieldNames An array of strings with the names of value fields.
   */
  function getFieldNames() internal pure returns (string[] memory fieldNames) {
    fieldNames = new string[](2);
    fieldNames[0] = "x";
    fieldNames[1] = "y";
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
   * @notice Get x.
   */
  function getX(bytes32 entityId) internal view returns (uint32 x) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = entityId;

    bytes32 _blob = StoreSwitch.getStaticField(_tableId, _keyTuple, 0, _fieldLayout);
    return (uint32(bytes4(_blob)));
  }

  /**
   * @notice Get x.
   */
  function _getX(bytes32 entityId) internal view returns (uint32 x) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = entityId;

    bytes32 _blob = StoreCore.getStaticField(_tableId, _keyTuple, 0, _fieldLayout);
    return (uint32(bytes4(_blob)));
  }

  /**
   * @notice Set x.
   */
  function setX(bytes32 entityId, uint32 x) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = entityId;

    StoreSwitch.setStaticField(_tableId, _keyTuple, 0, abi.encodePacked((x)), _fieldLayout);
  }

  /**
   * @notice Set x.
   */
  function _setX(bytes32 entityId, uint32 x) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = entityId;

    StoreCore.setStaticField(_tableId, _keyTuple, 0, abi.encodePacked((x)), _fieldLayout);
  }

  /**
   * @notice Get y.
   */
  function getY(bytes32 entityId) internal view returns (uint32 y) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = entityId;

    bytes32 _blob = StoreSwitch.getStaticField(_tableId, _keyTuple, 1, _fieldLayout);
    return (uint32(bytes4(_blob)));
  }

  /**
   * @notice Get y.
   */
  function _getY(bytes32 entityId) internal view returns (uint32 y) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = entityId;

    bytes32 _blob = StoreCore.getStaticField(_tableId, _keyTuple, 1, _fieldLayout);
    return (uint32(bytes4(_blob)));
  }

  /**
   * @notice Set y.
   */
  function setY(bytes32 entityId, uint32 y) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = entityId;

    StoreSwitch.setStaticField(_tableId, _keyTuple, 1, abi.encodePacked((y)), _fieldLayout);
  }

  /**
   * @notice Set y.
   */
  function _setY(bytes32 entityId, uint32 y) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = entityId;

    StoreCore.setStaticField(_tableId, _keyTuple, 1, abi.encodePacked((y)), _fieldLayout);
  }

  /**
   * @notice Get the full data.
   */
  function get(bytes32 entityId) internal view returns (PositionData memory _table) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = entityId;

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
  function _get(bytes32 entityId) internal view returns (PositionData memory _table) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = entityId;

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
  function set(bytes32 entityId, uint32 x, uint32 y) internal {
    bytes memory _staticData = encodeStatic(x, y);

    EncodedLengths _encodedLengths;
    bytes memory _dynamicData;

    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = entityId;

    StoreSwitch.setRecord(_tableId, _keyTuple, _staticData, _encodedLengths, _dynamicData);
  }

  /**
   * @notice Set the full data using individual values.
   */
  function _set(bytes32 entityId, uint32 x, uint32 y) internal {
    bytes memory _staticData = encodeStatic(x, y);

    EncodedLengths _encodedLengths;
    bytes memory _dynamicData;

    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = entityId;

    StoreCore.setRecord(_tableId, _keyTuple, _staticData, _encodedLengths, _dynamicData, _fieldLayout);
  }

  /**
   * @notice Set the full data using the data struct.
   */
  function set(bytes32 entityId, PositionData memory _table) internal {
    bytes memory _staticData = encodeStatic(_table.x, _table.y);

    EncodedLengths _encodedLengths;
    bytes memory _dynamicData;

    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = entityId;

    StoreSwitch.setRecord(_tableId, _keyTuple, _staticData, _encodedLengths, _dynamicData);
  }

  /**
   * @notice Set the full data using the data struct.
   */
  function _set(bytes32 entityId, PositionData memory _table) internal {
    bytes memory _staticData = encodeStatic(_table.x, _table.y);

    EncodedLengths _encodedLengths;
    bytes memory _dynamicData;

    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = entityId;

    StoreCore.setRecord(_tableId, _keyTuple, _staticData, _encodedLengths, _dynamicData, _fieldLayout);
  }

  /**
   * @notice Decode the tightly packed blob of static data using this table's field layout.
   */
  function decodeStatic(bytes memory _blob) internal pure returns (uint32 x, uint32 y) {
    x = (uint32(Bytes.getBytes4(_blob, 0)));

    y = (uint32(Bytes.getBytes4(_blob, 4)));
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
  ) internal pure returns (PositionData memory _table) {
    (_table.x, _table.y) = decodeStatic(_staticData);
  }

  /**
   * @notice Delete all data for given keys.
   */
  function deleteRecord(bytes32 entityId) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = entityId;

    StoreSwitch.deleteRecord(_tableId, _keyTuple);
  }

  /**
   * @notice Delete all data for given keys.
   */
  function _deleteRecord(bytes32 entityId) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = entityId;

    StoreCore.deleteRecord(_tableId, _keyTuple, _fieldLayout);
  }

  /**
   * @notice Tightly pack static (fixed length) data using this table's schema.
   * @return The static data, encoded into a sequence of bytes.
   */
  function encodeStatic(uint32 x, uint32 y) internal pure returns (bytes memory) {
    return abi.encodePacked(x, y);
  }

  /**
   * @notice Encode all of a record's fields.
   * @return The static (fixed length) data, encoded into a sequence of bytes.
   * @return The lengths of the dynamic fields (packed into a single bytes32 value).
   * @return The dynamic (variable length) data, encoded into a sequence of bytes.
   */
  function encode(uint32 x, uint32 y) internal pure returns (bytes memory, EncodedLengths, bytes memory) {
    bytes memory _staticData = encodeStatic(x, y);

    EncodedLengths _encodedLengths;
    bytes memory _dynamicData;

    return (_staticData, _encodedLengths, _dynamicData);
  }

  /**
   * @notice Encode keys as a bytes32 array using this table's field layout.
   */
  function encodeKeyTuple(bytes32 entityId) internal pure returns (bytes32[] memory) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = entityId;

    return _keyTuple;
  }
}
