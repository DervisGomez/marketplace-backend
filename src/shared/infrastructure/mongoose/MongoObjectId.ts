import { Types } from 'mongoose';

type ObjectIdInput = string | number | Uint8Array | Types.ObjectId;

function toObjectId(value: ObjectIdInput): Types.ObjectId {
    return new Types.ObjectId(value);
}

export = toObjectId;
