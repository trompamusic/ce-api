import { neo4jgraphql } from "neo4j-graphql-js";
import fs from "fs";
import path from "path";

/*
 * Check for GRAPHQL_SCHEMA environment variable to specify schema file
 * fallback to schema.graphql is GRAPHQL_SCHEMA environment variable is not set
 */

export const resolvers = {
  // query resolvers
  Query: {
    thingsBySubstring: neo4jgraphql
  },

  // interface resolvers
  MetadataInterface: {
    __resolveType(obj, context, info){
      var typeUniqueProperties = {"target":"Action","isBasedOn":"CreativeWork","attendee":"Event","department":"Organization","birthData":"Person","containedInPlace":"Place","manufacturer":"Product","grantee":"DigitalDocumentPermission","occupationLocation":"Occupation","videoQuality":"VideoObject","transcript":"AudioObject","distribution":"Dataset","measurementTechnique":"DataDownload","exifData":"ImageObject","albumProductionType":"MusicAlbum","numTracks":"MusicPlaylist","firstPerformance":"MusicComposition","inPlaylist":"MusicRecording"};
      for (var key in typeUniqueProperties) {
        if(key in typeUniqueProperties){
          return typeUniqueProperties[key];
        }
      }
      return null;
    },
  },
  ThingInterface: {
    __resolveType(obj, context, info){
      var typeUniqueProperties = {"target":"Action","isBasedOn":"CreativeWork","attendee":"Event","department":"Organization","birthData":"Person","containedInPlace":"Place","manufacturer":"Product","grantee":"DigitalDocumentPermission","occupationLocation":"Occupation","videoQuality":"VideoObject","transcript":"AudioObject","distribution":"Dataset","measurementTechnique":"DataDownload","exifData":"ImageObject","albumProductionType":"MusicAlbum","numTracks":"MusicPlaylist","firstPerformance":"MusicComposition","inPlaylist":"MusicRecording"};
      for (var key in typeUniqueProperties) {
        if(key in obj){
          return typeUniqueProperties[key];
        }
      }
      return null;
    },
  },
  // SKOSInterface: {
  //   __resolveType(obj, context, info){
  //     var typeUniqueProperties = {"target":"Action","isBasedOn":"CreativeWork","attendee":"Event","department":"Organization","birthData":"Person","containedInPlace":"Place","manufacturer":"Product","grantee":"DigitalDocumentPermission","occupationLocation":"Occupation","videoQuality":"VideoObject","transcript":"AudioObject","distribution":"Dataset","measurementTechnique":"DataDownload","exifData":"ImageObject","albumProductionType":"MusicAlbum","numTracks":"MusicPlaylist","firstPerformance":"MusicComposition","inPlaylist":"MusicRecording"};
  //     for (var key in typeUniqueProperties) {
  //       if(key in obj){
  //         return typeUniqueProperties[key];
  //       }
  //     }
  //     return 'Thing';
  //   },
  // },
  CreativeWorkInterface: {
    __resolveType(obj, context, info){
      var typeUniqueProperties = {"articleBody":"Article","hasDigitalDocumentPermission":"DigitalDocument","itemReviewed":"Review","contentUrl":"MediaObject","videoQuality":"VideoObject","transcript":"AudioObject","distribution":"Dataset","measurementTechnique":"DataDownload","exifData":"ImageObject","albumProductionType":"MusicAlbum","numTracks":"MusicPlaylist","firstPerformance":"MusicComposition","inPlaylist":"MusicRecording"};
      for (var key in typeUniqueProperties) {
        if(key in obj){
          return typeUniqueProperties[key];
        }
      }
      return 'CreativeWork';
    },
  },
  OrganizationInterface: {
    __resolveType(obj, context, info){
      if(obj.album){
        return 'MusicGroup';
      }
      return 'Organization';
    },
  },
  MediaObjectInterface: {
    __resolveType(obj, context, info){
      var typeUniqueProperties = {"videoQuality":"VideoObject","transcript":"AudioObject","distribution":"Dataset","measurementTechnique":"DataDownload","exifData":"ImageObject","albumProductionType":"MusicAlbum","numTracks":"MusicPlaylist","firstPerformance":"MusicComposition","inPlaylist":"MusicRecording"};
      for (var key in typeUniqueProperties) {
        if(key in obj){
          return typeUniqueProperties[key];
        }
      }
      return 'MediaObject';
    },
  },

  // union resolvers
  MusicCreator: {
    __resolveType(obj, context, info){
      if(obj.birthDate){
        return 'Person';
      }
      return 'MusicGroup';
    },
  },
  LegalPerson: {
    __resolveType(obj, context, info){
      var typeUniqueProperties = {"album":"MusicGroup","birthDate":"Person"};
      for (var key in typeUniqueProperties) {
        if(key in obj){
          return typeUniqueProperties[key];
        }
      }
      return 'Organization';
    },
  },
  CreativeWorkBase: {
    __resolveType(obj, context, info){
      var typeUniqueProperties = {"manufacturer":"Product","articleBody":"Article","hasDigitalDocumentPermission":"DigitalDocument","itemReviewed":"Review", "videoQuality":"VideoObject","transcript":"AudioObject","distribution":"Dataset","measurementTechnique":"DataDownload","exifData":"ImageObject","firstPerformance":"MusicComposition","numTracks":"MusicPlaylist","inAlbum":"MusicRecording","contentUrl":"MediaObject"};
      for (var key in typeUniqueProperties) {
        if(key in obj){
          return typeUniqueProperties[key];
        }
      }
      return 'CreativeWork';
    },
  },
};

export const typeDefs = fs
  .readFileSync(
    process.env.GRAPHQL_SCHEMA || path.join(__dirname, "schema.graphql")
  )
  .toString("utf-8");
