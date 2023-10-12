/**
 * @constructor
 */
const SizeUnitFactory = function()
{
    /**
     * @enum {number}
     * @type {{B: number, MB: number, KB: number, GB: number}}
     */
    this.SIZES = {
        B: 1 << 0,
        KB: 1 << 1,
        MB: 1 << 2,
        GB: 1 << 3
    };

    /**
     * @enum {number}
     * @type {{BxKB: number, MBxGB: number, BxMB: number, KBxMB: number, KBxGB: number, BxGB: number}}
     */
    this.SIZE_COMBOS = {
        BxKB: this.SIZES.B | this.SIZES.KB,
        BxMB: this.SIZES.B | this.SIZES.MB,
        BxGB: this.SIZES.B | this.SIZES.GB,
        KBxMB: this.SIZES.KB | this.SIZES.MB,
        KBxGB: this.SIZES.KB | this.SIZES.GB,
        MBxGB: this.SIZES.MB | this.SIZES.GB
    };

    this.sizeCombosArray = Object.values(this.SIZE_COMBOS).sort((a, b) => a - b);

    /** @type {Object.<SizeUnit.SIZE_COMBOS, number>} */
    this.SIZE_COMBOS_QUOTIENTS = { };
    this.SIZE_COMBOS_QUOTIENTS[this.SIZE_COMBOS.BxKB] = 1000;
    this.SIZE_COMBOS_QUOTIENTS[this.SIZE_COMBOS.KBxMB] = 1000;
    this.SIZE_COMBOS_QUOTIENTS[this.SIZE_COMBOS.MBxGB] = 1000;
    this.SIZE_COMBOS_QUOTIENTS[this.SIZE_COMBOS.BxMB] = 1_000_000;
    this.SIZE_COMBOS_QUOTIENTS[this.SIZE_COMBOS.KBxGB] = 1_000_000;
    this.SIZE_COMBOS_QUOTIENTS[this.SIZE_COMBOS.BxGB] = 1_000_000_000;

    /**
     * @method
     * @param {SizeUnit.SIZE_COMBOS} from
     * @param {SizeUnit.SIZE_COMBOS} to
     * @param {number} amount
     *
     * @throws {Error} If no matching combo is found
     * @returns
     */
    this.convertUpwards = (from, to, amount) =>
    {
        const selection = from | to;

        // binary search this.SIZE_COMBOS to find the matching combo
        let i = 0;
        let j = this.sizeCombosArray.length - 1;
        let targetIndex = Math.floor((i + j) / 2);
        let selectedCombo = null;
        while(i <= j)
        {
            if(this.sizeCombosArray[targetIndex] === selection) {
                selectedCombo = this.sizeCombosArray[targetIndex];
                break;
            } else if(this.sizeCombosArray[targetIndex] < selection) {
                i = targetIndex + 1;
                targetIndex = i;
            } else {
                j = targetIndex - 1;
                targetIndex = j;
            }
        }

        if(selectedCombo === null)
            throw new Error(`No matching combo found for ${from} and ${to}`);

        return amount / this.SIZE_COMBOS_QUOTIENTS[selectedCombo];
    }

    this.sizeToName = (size) =>
    {
        switch(size)
        {
            case this.SIZES.B:
                return "B";
            case this.SIZES.KB:
                return "KB";
            case this.SIZES.MB:
                return "MB";
            case this.SIZES.GB:
                return "GB";
            default:
                return "Unknown";
        }
    }
}

export const SizeUnit = new SizeUnitFactory();

export function FileSize()
{
    this.size = 0;
    this.unit = SizeUnit.SIZES.B;

    /**
     * @method
     * @param size
     * @param unit
     * @returns {number} the new size
     */
    this.add = function(size, unit)
    {
        if(this.unit === unit) {
            this.size += size;
        } else if (this.unit < unit) {
            this.size = SizeUnit.convertUpwards(this.unit, unit, this.size) + size;
            this.unit = unit;
        }

        if(this.size > 1000 && this.unit !== SizeUnit.SIZES.GB) {
            this.size = SizeUnit.convertUpwards(this.unit, this.unit << 1, this.size);
            this.unit = this.unit << 1;
        }
    }

    this.get = () =>
    {
        return {
            size: this.size,
            unit: SizeUnit.sizeToName(this.unit)
        }
    }
}