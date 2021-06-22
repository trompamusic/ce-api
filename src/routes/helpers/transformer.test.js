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
