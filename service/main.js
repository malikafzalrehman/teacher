import firestore from '@react-native-firebase/firestore';

export async function saveData(collection, doc, jsonObject) {
  let success = false;
  await firestore()
    .collection(collection)
    .doc(doc)
    .set(jsonObject, {merge: true})
    .then(() => {
      success = true;
    })
    .catch(function (error) {
      console.error('Error writing document: ', error);
      success = false;
    });

  return success;
}

export async function saveDataSub(
  collection,
  doc,
  subCol,
  subid,
  jsonObject,
) {
  let success = false;
  await firestore()
    .collection(collection)
    .doc(doc)
    .collection(subCol)
    .doc(subid)
    .set(jsonObject, {merge: true})
    .then(e => {
      console.log(e);
      success = true;
    })
    .catch(function (error) {
      console.error('Error writing document: ', error);
      success = false;
    });
  return success;
}
export function getData(collection, doc, objectKey) {
  // check if data exists on the given path
  if (!objectKey) {
    return firestore()
      .collection(collection)
      .doc(doc)
      .get()
      .then(function (doc) {
        if (doc.exists) {
          return doc.data();
        } else {
          return false;
        }
      });
  } else {
    return firestore()
      .collection(collection)
      .doc(doc)
      .get()
      .then((doc) => {
        if (doc.exists && doc.data()[objectKey] != undefined) {
          return doc.data()[objectKey];
        } else {
          return false;
        }
      });
  }
}
export async function getDatasub(collection, doc, subcol) {
  let data = [];
  let querySnapshot = await firestore()
    .collection(collection)
    .doc(doc)
    .collection(subcol)
    .get();
  querySnapshot.forEach(function (doc) {
    if (doc.exists) {
      data.push(doc.data());
    } else {
      console.log('No document found!');
    }
  });
  return data;
}
export async function getDatasubDoc(
  collection,
  doc,
  subcol,
  subdoc,
  objectKey,
) {
  if (objectKey === undefined) {
    return firestore()
      .collection(collection)
      .doc(doc)
      .collection(subcol)
      .doc(subdoc)
      .get()
      .then(function (doc) {
        if (doc.exists) {
          return doc.data();
        } else {
          return false;
        }
      });
  } else {
    return firestore()
      .collection(collection)
      .doc(doc)
      .collection(subcol)
      .doc(subdoc)
      .get()
      .then((doc) => {
        if (doc.exists && doc.data()[objectKey] != undefined) {
          return doc.data()[objectKey];
        } else {
          return false;
        }
      });
  }
}

export async function getDatasubDoc2(
  collection,
  doc,
  subcol,
  subdoc,
  sub2col,
) {
  let data = [];
  let querySnapshot = await firestore()
    .collection(collection)
    .doc(doc)
    .collection(subcol)
    .doc(subdoc)
    .collection(sub2col)
    .get();
  querySnapshot.forEach(function (doc) {
    if (doc.exists) {
      data.push(doc.data());
    } else {
      console.log('No document found!');
    }
  });
  return data;
}

export async function saveDataSub2(
  collection,
  doc,
  subCol,
  subdoc,
  sub2col,
  subdoc2,
  jsonObject,
) {
  let success = false;
  await firestore()
    .collection(collection)
    .doc(doc)
    .collection(subCol)
    .doc(subdoc)
    .collection(sub2col)
    .doc(subdoc2)
    .set(jsonObject, {merge: true})
    .then(() => {
      success = true;
    })
    .catch(function (error) {
      console.error('Error writing document: ', error);
      success = false;
    });
  return success;
}
export async function uploadImage(uri, path) {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const ref = storage().ref(path);
    const task = ref.put(blob);
    return new Promise((resolve, reject) => {
      task.on(
        'state_changed',
        (taskSnapshot) => {
          console.log(
            `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
          );
        },
        (err) => {
          reject(err);
        },
        async () => {
          const url = await task.snapshot.ref.getDownloadURL();
          resolve(url);
          return url;
        },
      );
    });
  } catch (err) {
    console.log('uploadImage error: ' + err);
  }
}
export async function getAllOfCollection(collection) {
  let data = [];
  let querySnapshot = await firestore().collection(collection).get();
  querySnapshot.forEach(function (doc) {
    if (doc.exists) {
      data.push(doc.data());
    } else {
      console.log('No document found!');
    }
  });
  return data;
}
export async function getAllOfCollectionwhere(
  collection,
  key,
  id,
) {
  let data = [];
  let querySnapshot = await firestore()
    .collection(collection)
    .where(key, '==', id)
    .get();
  querySnapshot.forEach(function (doc) {
    if (doc.exists) {
      data.push(doc.data());
    } else {
      console.log('No document found!');
    }
  });
  return data;
}
export async function getAllOfCollectionwherenote(
  collection,
  key,
  id,
  id1,
) {
  let data = [];
  let querySnapshot = await firestore()
    .collection(collection)
    .where('attend', 'not-in', id1)
    .where(key, '==', id)
    .get();
  querySnapshot.forEach(function (doc) {
    if (doc.exists) {
      data.push(doc.data());
    } else {
      console.log('No document found!');
    }
  });
  return data;
}
export async function getAllOfCollectionwhere1(
  collection,
  key,
  id,
) {
  let data = [];
  let querySnapshot = await firestore()
    .collection(collection)
    .where(key, 'array-contains', id)
    .get();
  querySnapshot.forEach(function (doc) {
    if (doc.exists) {
      data.push(doc.data());
    } else {
      console.log('No document found!');
    }
  });
  return data;
}   
export async function getAllOfCollectionwherewhere(
  collection,
  key,
  id,
  key2,
  id2,
) {
  try {
    const querySnapshot = await firestore()
      .collection(collection)
      .where(key, '==', id)
      .where(key2, '==', id2)
      .get();
      var data = [];
    querySnapshot.forEach((doc) => {
      if (doc.exists) {
        data.push(doc.data());
      }
    });

    if (data.length === 0) {
      console.log('No documents found!');
    }
 
    return data;
  } catch (error) {
    console.error('Error getting documents: ', error);
    throw error; // Re-throw the error so the caller can handle it
  }
}
export async function upDateCollectionData(
  collection,
  doc,
  jsonObject,
) {
  await firestore()
    .collection(collection)
    .doc(doc)
    .update(jsonObject)
    .then(async () => {
      console.log(2);
      return true;
    })
    .catch(function (error) {
      console.error('Error writing document: ', error);
    });
}
export async function saveDataSubdelete(
  collection,
  doc,
  subCol,
  subid,
) {
  await firestore()
    .collection(collection)
    .doc(doc)
    .collection(subCol)
    .doc(subid)
    .delete();
}
export async function Delete(collection, doc) {
  console.log(collection, doc);
  
  await firestore().collection(collection).doc(doc).delete();
}
export async function DeleteImage(collection, doc, value) {
  console.log(value, 'Event/' + doc + '');
  await firestore()
    .doc('Event/' + doc + '')
    .update({
      Images: firestore.FieldValue.arrayRemove(value),
    })
    .catch(e => {
      console.log(e);
    });
}
export async function AddImage(collection, doc, value) {
  console.log(value, 'Event/' + doc + '');
  await firestore()
    .doc('Event/' + doc + '')
    .update({
      Images: firestore.FieldValue.arrayUnion(value),
    })
    .catch(e => {
      console.log(e);
    });
}
export async function arryAdd(collection, doc, value, id) {
  await firestore()
    .doc('Event/' + doc + '')
    .update({accept: firestore.FieldValue.arrayUnion(value)})
    .then(async e => {
      console.log(e);
    })
    .catch(function (error) {
      console.error('Error writing document: ', error);
    });

  await firestore()
    .doc('Notification/' + id + '')
    .update({
      receiver: firestore.FieldValue.arrayRemove(value),
    })
    .catch(e => {
      console.log(e);
    });
}
export async function aceptDelete(collection, doc, value) {
  console.log(value, 'Event/' + doc + '');
  await firestore()
    .doc('Event/' + doc + '')
    .update({
      accept: firestore.FieldValue.arrayRemove(value),
    })
    .catch(e => {
      console.log(e);
    });
}

