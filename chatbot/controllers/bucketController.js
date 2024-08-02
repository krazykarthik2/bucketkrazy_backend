const { Bucket } = require("../models");
const bcrypt = require("bcryptjs");

function isMember(bucket, username) {
  return bucket.joinedMembers.includes(username);
}
function addMember(bucket, username) {
  bucket.joinedMembers.push(username);
}
function isAdmin(bucket, username) {
  return bucket.adminUsername === username;
}

/**
 * Adds a username to the pending approval list of a bucket if it is not already in the list.
 *
 * @param {Object} bucket - The bucket object.
 * @param {string} username - The username to add to the pending approval list.
 * @return {boolean} - Returns true if the username was already in the pending approval list, otherwise false.
 */
function makePendingApproval(bucket, username) {
  if (bucket.pendingApproval.includes(username)) {
    return true;
  }
  bucket.pendingApproval.push(username);
  return false;
}
// Create a new bucket
exports.createBucket = async (req, res) => {
  try {
    const { name, type, password } = req.body;
    const adminName = req.username;
    const bucket = new Bucket({ name, type, adminUsername: adminName });

    if (type === "password") {
      bucket.password = await bcrypt.hash(password, 10);
    }

    await bucket.save();
    res.status(201).json({ message: "Bucket created successfully", bucket });
  } catch (error) {
    res.status(500).json({ message: "Error creating bucket", error });
  }
};

// Add message to bucket
exports.addMessage = async (req, res) => {
  try {
    const { bucketName, tobeAdded, type } = req.body;
    const username = req.username;
    const bucket = await Bucket.findOne({ name: bucketName });
    if (!bucket) {
      return res.status(404).json({ message: "Bucket not found" });
    }
    if (!isMember(bucket, username)) {
      return res
        .status(403)
        .json({ message: "You are not a member of this bucket" });
    }
    if (type == "message") {
      bucket.messages.push(tobeAdded);
    } else if (type == "image") {
      bucket.images.push(tobeAdded);
    } else if (type == "video") {
      bucket.videos.push(tobeAdded);
    } else if (type == "file") {
      bucket.files.push(tobeAdded);
    } else if (type == "audio") {
      bucket.audio.push(tobeAdded);
    }else {
      return res.status(400).json({ message: "Invalid type" });
    }
    await bucket.save();
    res.status(200).json({ message: "Message added to bucket", bucket });
  } catch (error) {
    res.status(500).json({ message: "Error adding message to bucket", error });
  }
};

// Delete a bucket
exports.deleteBucket = async (req, res) => {
  try {
    const { id } = req.params;
    const bucket = await Bucket.findByIdAndDelete(id);

    if (!bucket) {
      return res.status(404).json({ message: "Bucket not found" });
    }
    if (!isAdmin(bucket, req.username)) {
      return res
        .status(403)
        .json({ message: "You are not an admin of this bucket" });
    }

    res.status(200).json({ message: "Bucket deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting bucket", error });
  }
};
// Discover a bucket
exports.discoverBucket = async (req, res) => {
  try {
    const { bucketName } = req.params;
    const { username } = req.query;
    const bucket = await Bucket.findOne({ name: bucketName });

    if (!bucket) {
      return res.status(404).json({ message: "Bucket not found" });
    }

    const isMember = isMember(bucket, username);
    res.status(200).json({ bucket, isMember });
  } catch (error) {
    res.status(500).json({ message: "Error discovering bucket", error });
  }
};

// Join a bucket
exports.joinBucket = async (req, res) => {
  try {
    const { bucketId, username, password } = req.body;
    const bucket = await Bucket.findById(bucketId);

    if (!bucket) {
      return res.status(404).json({ message: "Bucket not found" });
    }

    if (isMember(bucket, username)) {
      return res
        .status(200)
        .json({ message: "You have already joined this bucket" });
    }

    if (bucket.type === "open") {
      addMember(bucket, username);
    } else if (bucket.type === "password") {
      if (!(await bcrypt.compare(password, bucket.password))) {
        return res.status(401).json({ message: "Incorrect password" });
      }
      addMember(bucket, username);
    } else if (bucket.type === "admin") {
      if (makePendingApproval(bucket, username)) {
        return res
          .status(400)
          .json({ message: "User already in pending approvals" });
      } else {
        return res
          .status(200)
          .json({ message: "Request sent to admin for approval" });
      }
    }

    await bucket.save();
    res.status(200).json({ message: "Successfully joined the bucket", bucket });
  } catch (error) {
    res.status(500).json({ message: "Error joining bucket", error });
  }
};

// Approve a member for a bucket
exports.approveMember = async (req, res) => {
  try {
    const { bucketId, username } = req.body;
    const bucket = await Bucket.findById(bucketId);

    if (!bucket) {
      return res.status(404).json({ message: "Bucket not found" });
    }
    if (!isAdmin(bucket, req.username)) {
      return res
        .status(403)
        .json({ message: "You are not an admin of this bucket" });
    }

    if (!bucket.pendingApproval.includes(username)) {
      return res
        .status(400)
        .json({ message: "User not found in pending approvals" });
    }

    bucket.pendingApproval.remove(username);
    addMember(bucket, username);
    await bucket.save();

    res
      .status(200)
      .json({ message: "User approved and added to bucket", bucket });
  } catch (error) {
    res.status(500).json({ message: "Error approving member", error });
  }
};
