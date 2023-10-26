/*
    Copyright (C) 2023 Alexander Emanuelsson (alexemanuelol)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

    https://github.com/alexemanuelol/rustplusplus

*/

const Fuse = require('fuse.js')

const Items = require('./Items');

const CraftData = require('../staticFiles/rustlabsCraftData.json');
const ResearchData = require('../staticFiles/rustlabsResearchData.json');
const RecycleData = require('../staticFiles/rustlabsRecycleData.json');
const DurabilityData = require('../staticFiles/rustlabsDurabilityData.json');


class RustLabs {


    /**
     *  Constructor for the RustLabs Class.
     */
    constructor() {
        this._craftData = CraftData;
        this._researchData = ResearchData;
        this._recycleData = RecycleData;
        this._durabilityData = DurabilityData;

        this._items = new Items();

        this._durabilityGroups = [
            'explosive',
            'melee',
            'throw',
            'guns',
            'torpedo',
            'turret'
        ];

        this._durabilityWhich = [
            'hard',
            'soft',
            'both'
        ];

        this._orderedBy = [
            'quantityHighFirst',
            'quantityLowFirst',
            'timeHighFirst',
            'timeLowFirst',
            'fuelHighFirst',
            'fuelLowFirst',
            'sulfurHighFirst',
            'sulfurLowFirst'
        ];

        const flattenedBuildingBlocks = Object.keys(this.durabilityData['buildingBlocks']).map(e => ({ ['name']: e }));
        this._fuseBuildingBlocks = new Fuse(flattenedBuildingBlocks, { keys: [{ name: 'name', weight: 0.7 }] });

        const flattenedOther = Object.keys(this.durabilityData['other']).map(e => ({ ['name']: e }));
        this._fuseOther = new Fuse(flattenedOther, { keys: [{ name: 'name', weight: 0.7 }] });
    }


    /***********************************************************************************
     *  Getters
     **********************************************************************************/

    get craftData() { return this._craftData; }
    get researchData() { return this._researchData; }
    get recycleData() { return this._recycleData; }
    get durabilityData() { return this._durabilityData; }
    get items() { return this._items; }
    get durabilityGroups() { return this._durabilityGroups }
    get durabilityWhich() { return this._durabilityWhich; }
    get orderedBy() { return this._orderedBy; }
    get fuseBuildingBlocks() { return this._fuseBuildingBlocks; }
    get fuseOther() { return this._fuseOther; }


    /***********************************************************************************
     *  General functions
     **********************************************************************************/

    /**
     *  Get all durability groups.
     *  @return {array} An array of all the durability groups.
     */
    getDurabilityGroups() {
        return this.durabilityGroups;
    }

    /**
     *  Get all durability which.
     *  @return {array} An array of all the durability which.
     */
    getDurabilityWhich() {
        return this.durabilityWhich;
    }

    /**
     *  Get all ordered by.
     *  @return {array} An array of all the ordered by.
     */
    getOrderedBy() {
        return this.orderedBy;
    }

    /**
     *  Get the closest building block name by name.
     *  @param {string} name The name of the building block.
     *  @return {string|undefined} undefined if the building block couldnt be found, otherwise the closest name.
     */
    getClosestBuildingBlockNameByName(name) {
        const result = this.fuseBuildingBlocks.search(name);
        if (result.length !== 0) {
            return result[0].item.name;
        }
        return undefined;
    }

    /**
     *  Get the closest other name by name.
     *  @param {string} name The name of the other.
     *  @return {string|undefined} undefined if the other couldnt be found, otherwise the closest name.
     */
    getClosestOtherNameByName(name) {
        const result = this.fuseOther.search(name);
        if (result.length !== 0) {
            return result[0].item.name;
        }
        return undefined;
    }

    /**
     *  Get an array ordered by [key] - high to low or low to high
     *  @param {array} array The array to sort.
     *  @param {string} key The key to sort by.
     *  @param {boolean} orderedByLow true if it should be ordered from low to high, false from high to low.
     *  @return {array} The sorted array.
     */
    getArrayOrderedBy(array, key, orderedByLow) {
        if (orderedByLow) {
            return array.sort(function (a, b) { return a[key] - b[key] });
        }
        else {
            return array.sort(function (a, b) { return b[key] - a[key] });
        }
    }

    /**
     *  Get an array ordered by [key] - high to low or low to high
     *  @param {array} array The array to sort.
     *  @param {string} orderedBy The choice to order by.
     *  @return {array} The sorted array.
     */
    getArrayOrderedByChoice(array, orderedBy = null) {
        switch (orderedBy) {
            case 'quantityHighFirst': {
                return this.getArrayOrderedBy(array, 'quantity', false);
            } break;

            case 'quantityLowFirst': {
                return this.getArrayOrderedBy(array, 'quantity', true);
            } break;

            case 'timeHighFirst': {
                return this.getArrayOrderedBy(array, 'time', false);
            } break;

            case 'timeLowFirst': {
                return this.getArrayOrderedBy(array, 'time', true);
            } break;

            case 'fuelHighFirst': {
                return this.getArrayOrderedBy(array, 'fuel', false);
            } break;

            case 'fuelLowFirst': {
                return this.getArrayOrderedBy(array, 'fuel', true);
            } break;

            case 'sulfurHighFirst': {
                return this.getArrayOrderedBy(array, 'sulfur', false);
            } break;

            case 'sulfurLowFirst': {
                return this.getArrayOrderedBy(array, 'sulfur', true);
            } break;

            default: {
                return array;
            } break;
        }
    }


    /***********************************************************************************
     *  Craft functions
     **********************************************************************************/

    /**
     *  Get craft details of an item.
     *  @param {string} name The name of the item.
     *  @return {array|null} null if something went wrong, otherwise [id, itemDetails, craftDetails]
     */
    getCraftDetailsByName(name) {
        if (typeof (name) !== 'string') return null;
        const id = this.items.getClosestItemIdByName(name);
        if (!id) return null;
        return this.getCraftDetailsById(id);
    }

    /**
     *  Get craft details of an item.
     *  @param {string} name The name of the item.
     *  @return {array|null} null if something went wrong, otherwise [id, itemDetails, craftDetails]
     */
    getCraftDetailsById(id) {
        if (!this.craftData.hasOwnProperty(id)) return null;
        return [id, this.items.items[id], this.craftData[id]];
    }


    /***********************************************************************************
     *  Research functions
     **********************************************************************************/

    /**
     *  Get research details of an item.
     *  @param {string} name The name of the item.
     *  @return {array|null} null if something went wrong, otherwise [id, itemDetails, researchDetails]
     */
    getResearchDetailsByName(name) {
        if (typeof (name) !== 'string') return null;
        const id = this.items.getClosestItemIdByName(name);
        if (!id) return null;
        return this.getResearchDetailsById(id);
    }

    /**
     *  Get research details of an item.
     *  @param {string} name The name of the item.
     *  @return {array|null} null if something went wrong, otherwise [id, itemDetails, researchDetails]
     */
    getResearchDetailsById(id) {
        if (!this.researchData.hasOwnProperty(id)) return null;
        return [id, this.items.items[id], this.researchData[id]];
    }


    /***********************************************************************************
     *  Recycle functions
     **********************************************************************************/

    /**
     *  Get recycle details of an item.
     *  @param {string} name The name of the item.
     *  @return {array|null} null if something went wrong, otherwise [id, itemDetails, recycleDetails]
     */
    getRecycleDetailsByName(name) {
        if (typeof (name) !== 'string') return null;
        const id = this.items.getClosestItemIdByName(name);
        if (!id) return null;
        return this.getRecycleDetailsById(id);
    }

    /**
     *  Get recycle details of an item.
     *  @param {string} name The name of the item.
     *  @return {array|null} null if something went wrong, otherwise [id, itemDetails, recycleDetails]
     */
    getRecycleDetailsById(id) {
        if (typeof (id) !== 'string') return null;
        if (!this.recycleData.hasOwnProperty(id)) return null;
        return [id, this.items.items[id], this.recycleData[id]];
    }


    /***********************************************************************************
     *  Durability functions
     **********************************************************************************/

    /**
     *  Get durability details of an item, building block or other.
     *  @param {string} name The name of the item, building block or other.
     *  @param {string} group The group of the item, building block or other.
     *  @param {string} which The which of the item, building block or other.
     *  @return {array|null} null if something went wrong, otherwise
     *      [type, id/name, itemDetails/name, durabilityDetails]
     */
    getDurabilityDetailsByName(name, group = null, which = null, orderedBy = null) {
        if (typeof (name) !== 'string') return null;
        if (group !== null && !this.durabilityGroups.includes(group)) return null;
        if (which !== null && !this.durabilityWhich.includes(which)) return null;

        let type = null;

        let foundName = null;
        if (!foundName) {
            foundName = this.getClosestOtherNameByName(name);
            if (foundName) type = 'other';
        }

        if (!foundName) {
            foundName = this.getClosestBuildingBlockNameByName(name);
            if (foundName) type = 'buildingBlocks';
        }

        if (!foundName) {
            foundName = this.items.getClosestItemIdByName(name);
            if (foundName) {
                return this.getDurabilityDetailsById(foundName, group, which);
            }
        }

        if (!foundName) return null;

        let content = [];
        for (const item of this.durabilityData[type][foundName]) {
            if (group !== null && item.group !== group) continue;
            if (which !== null && item.which !== which) continue;
            content.push(item);
        }

        content = this.getArrayOrderedByChoice(content, orderedBy);

        return [type, foundName, foundName, content];

    }

    /**
     *  Get durability details of an item.
     *  @param {string} id The id of the item.
     *  @param {string} group The group of the item.
     *  @param {string} which The which of the item.
     *  @return {array|null} null if something went wrong, otherwise [type, id, itemDetails, durabilityDetails]
     */
    getDurabilityDetailsById(id, group = null, which = null, orderedBy = null) {
        if (typeof (id) !== 'string') return null;
        if (!this.durabilityData['items'].hasOwnProperty(id)) return null;
        if (group !== null && !this.durabilityGroups.includes(group)) return null;
        if (which !== null && !this.durabilityWhich.includes(which)) return null;

        let content = [];
        for (const item of this.durabilityData['items'][id]) {
            if (group !== null && item.group !== group) continue;
            if (which !== null && item.which !== which) continue;
            content.push(item);
        }

        content = this.getArrayOrderedByChoice(content, orderedBy);

        return ['items', id, this.items.items[id], content];
    }
}

module.exports = RustLabs;