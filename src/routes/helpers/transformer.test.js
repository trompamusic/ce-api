import {preprocessDefinedTerm, transformJsonLD} from "./transformers";
import { DateTime } from 'neo4j-driver/lib/temporal-types'


describe('definedTermTest', function () {
    const sampleDocument = {
        "broaderMotivation": "commenting",
        "modified": new DateTime(2021, 6, 22, 10, 50, 24, 292000000, 0, null),
        "broaderUrl": null,
        "identifier": "77c376dd-009b-4460-a94c-ade21b1aa772",
        "image": "https://alastair.trompa-solid.upf.edu/annotation-images/slur.png",
        "additionalProperty": [],
        "creator": "https://alastair.trompa-solid.upf.edu/profile/card#me",
        "created": new DateTime(2021, 6, 22, 10, 50, 24, 292000000, 0, null),
        "additionalType": [
            "https://vocab.trompamusic.eu/vocab#AnnotationMotivationCollectionElement",
            "http://www.w3.org/ns/oa#Motivation"
        ],
        "potentialAction": [],
        "inDefinedTermSet": [
            "http://localhost:4000/7c0e9ac0-942a-422a-89b8-884444da6b5a"
        ],
        "termCode": "Slur"
    }

    it('generates jsonld using broaderMotivation', function() {
        const response = transformJsonLD("DefinedTerm", sampleDocument);
        expect(response["skos:broader"]).toEqual("oa:commenting");
    })

    it('generates jsonld using broaderUrl', function() {
        sampleDocument["broaderMotivation"] = null;
        sampleDocument["broaderUrl"] = "https://example.com#motivation";
        const response = transformJsonLD("DefinedTerm", sampleDocument);
        expect(response["skos:broader"]).toEqual("https://example.com#motivation");
    })

    it('Adds oa:Motivation additionalType if broader enum is present and type is not set', function () {
        const definedTerm = {
            "broaderMotivation": "commenting",
            "broaderUrl": null,
            "additionalProperty": [],
            "additionalType": [
                "https://vocab.trompamusic.eu/vocab#AnnotationMotivationCollectionElement"
            ],
            "inDefinedTermSet": [
                "http://localhost:4000/7c0e9ac0-942a-422a-89b8-884444da6b5a"
            ],
            "termCode": "Slur"
        }
        const result = preprocessDefinedTerm(definedTerm);
        expect(result["additionalType"].includes("https://www.w3.org/ns/oa#Motivation")).toEqual(true);
        expect(result["additionalType"].length).toEqual(2);
    });

    it('Adds oa:Motivation additionalType if broader url is present and type is not set', function () {
        const definedTerm = {
            "broaderMotivation": null,
            "broaderUrl": "https://example.com#Motivation",
            "additionalProperty": [],
            "additionalType": [
                "https://vocab.trompamusic.eu/vocab#AnnotationMotivationCollectionElement"
            ],
            "inDefinedTermSet": [
                "http://localhost:4000/7c0e9ac0-942a-422a-89b8-884444da6b5a"
            ],
            "termCode": "Slur"
        }
        const result = preprocessDefinedTerm(definedTerm);
        expect(result["additionalType"].includes("https://www.w3.org/ns/oa#Motivation")).toEqual(true);
        expect(result["additionalType"].length).toEqual(2);
    });

    it("Doesn't add oa:Motivation additionalType if it already exists", function () {
        const definedTerm = {
            "broaderMotivation": null,
            "broaderUrl": "https://example.com#Motivation",
            "additionalProperty": [],
            "additionalType": [
                "https://vocab.trompamusic.eu/vocab#AnnotationMotivationCollectionElement",
                "http://www.w3.org/ns/oa#Motivation"
            ],
            "inDefinedTermSet": [
                "http://localhost:4000/7c0e9ac0-942a-422a-89b8-884444da6b5a"
            ],
            "termCode": "Slur"
        }
        const result = preprocessDefinedTerm(definedTerm);
        expect(result["additionalType"].includes("http://www.w3.org/ns/oa#Motivation")).toEqual(true);
        expect(result["additionalType"].includes("https://www.w3.org/ns/oa#Motivation")).toEqual(false);
        expect(result["additionalType"].length).toEqual(2);
    });

    it("Doesn't add oa:Motivation additionalType if broader isn't set", function () {
        const definedTerm = {
            "broaderMotivation": null,
            "broaderUrl": null,
            "additionalProperty": [],
            "additionalType": null,
            "inDefinedTermSet": [
                "http://localhost:4000/7c0e9ac0-942a-422a-89b8-884444da6b5a"
            ],
            "termCode": "Slur"
        }
        const result = preprocessDefinedTerm(definedTerm);
        expect(result["additionalType"]).toEqual(null);
    });

    it('Prefixes motivation enums with oa: namespace', function () {
        const definedTerm = {
            "broaderMotivation": "commenting",
            "broaderUrl": null,
            "additionalProperty": [],
            "additionalType": null,
            "inDefinedTermSet": [
                "http://localhost:4000/7c0e9ac0-942a-422a-89b8-884444da6b5a"
            ],
            "termCode": "Slur"
        }
        const result = preprocessDefinedTerm(definedTerm);
        expect(result["broaderMotivation"]).toEqual("oa:commenting");
    });
});


describe("ItemList test", function() {
   it("Converts custom ItemList response to json-ld", function() {
       const itemListResponse = require("./testdata/itemlist.json");
       const itemListJsonLd = transformJsonLD("ItemList", itemListResponse, "http://localhost");

       expect(itemListJsonLd["@type"]).toEqual(["https://schema.org/ItemList", "http://www.w3.org/ns/ldp#Container", "http://www.w3.org/ns/ldp#BasicContainer", "https://vocab.trompamusic.eu/vocab#AnnotationSession"]);
       // Created and modified are adjusted before export
       expect(itemListJsonLd["dc:created"]).toEqual("2021-06-22T13:47:10.693Z");
       expect(itemListJsonLd["dc:modified"]).toEqual("2021-06-22T13:47:10.693Z");
       // First element, a ListItem whose `item` points to another thing in the CE
       const expectedElementOne = {
           "@id": "http://localhost/bb418c6b-7667-4559-96de-5716d9d52e2e",
           "@type": ["https://schema.org/ListItem"],
           "dc:identifier": "http://localhost/bb418c6b-7667-4559-96de-5716d9d52e2e",
           "identifier": "http://localhost/bb418c6b-7667-4559-96de-5716d9d52e2e",
           "item": {"@id": "http://localhost/e03dd66d-17ba-4d91-a409-d1eb2cb3d3bb"}
       }
       expect(itemListJsonLd.itemListElement[0]).toEqual(expectedElementOne);
       // Second element, a ListItem whose `itemUrl` points to an external URL
       const expectedElementType = {
           "@id": "http://localhost/551877a6-c61b-4fc7-8174-17247d460823",
           "@type":  ["https://schema.org/ListItem"],
           "dc:identifier": "http://localhost/551877a6-c61b-4fc7-8174-17247d460823",
           "identifier": "http://localhost/551877a6-c61b-4fc7-8174-17247d460823",
           "item": {"@id": "https://example.com/externalItem"}
       }
       expect(itemListJsonLd.itemListElement[1]).toEqual(expectedElementType);
       // Third element, a DigitalDocument in the CE with no ListItem
       expect(itemListJsonLd.itemListElement[2]).toEqual({"@id": "http://localhost/f3ed1b21-cc30-43be-805a-ce2b56b78e09"});
   });
});