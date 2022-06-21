"use strict";

import { IVS } from "aws-sdk";

const AWS = require("aws-sdk");

const region = "eu-west-1";

exports.handler = (event, context, callback) => {
  console.log("LogScheduledEvent");
  console.log("Received event:", JSON.stringify(event, null, 2));
  getIVSActiveChannels();
};

const ivs = new AWS.IVS({
  apiVersion: "2020-07-14",
  region, // Must be in one of the supported regions
});

const service = new AWS.Service({
  endpoint: "https://metastreammn.herokuapp.com",
  convertResponseTypes: false,
  apiConfig: {
    metadata: {
      protocol: "rest-json", // API is JSON-based
    },
    operations: {
      activeChannels: {
        http: {
          method: "GET",
          requestUri: "/events/activeChannels",
        },
        input: {
          type: "structure",
          required: [],
        },
      },
    },
  },
});

service.isGlobalEndpoint = true;

const dbChannels = () => {
  // GET cases by ID, here '1'

  service.activeChannels({}, (err, data) => {
    if (err) {
      console.error(":>> operation error:", err);
    }
    console.log("data:", data);
    return data;
  });
};

const getIVSActiveChannels = async () => {
  try {
    const result: IVS.ChannelList = await ivs.listChannels().promise();
    console.info("getChannels event > result:", result);
    return result;
  } catch (err) {
    console.info("getChannels event > err:", err, err.stack);
  }
};

const _deleteChannel = async (arn) => {
  const params = {
    arn,
  };

  console.log("_deleteChannel > params:", JSON.stringify(params, null, 2));

  try {
    const result = await ivs.deleteChannel(params).promise();
    // console.info("_deleteChannel > result:", result);
    return result;
  } catch (err) {
    // console.info("_deleteChannel > err:", err, err.stack);
    throw new Error(err);
  }
};

const _stopStream = async (params) => {
  console.log("_stopStream > params:", JSON.stringify(params, null, 2));

  try {
    const result = await ivs.stopStream(params).promise();
    // console.info("_stopStream > result:", result);
    return result;
  } catch (err) {
    console.info("_stopStream > err:", err);
    console.info("_stopStream > err.stack:", err.stack);

    // Ignore error
    if (/ChannelNotBroadcasting/.test(err)) {
      return;
    }

    throw new Error(err);
  }
};

const cleanUnusedChannels = async () => {
  try {
    const ivsList = await getIVSActiveChannels();
    if (ivsList) {
      const list = await dbChannels();
      const deleteList = await compareChannels(ivsList, list);
      console.log("deleteList", ivsList, list);
    }
  } catch (err) {
    console.info("cleanChanell", err);
    throw new Error(err);
  }
};

const compareChannels = (ivsList, list) => {
  console.log("IVS:", ivsList, "DB", list);
  return [];
};
