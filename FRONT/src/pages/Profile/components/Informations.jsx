import React, { useContext, useEffect, useState } from "react";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import { changePwdAsConnected, signup, updateUser } from "../../../apis/users";
import Modal from "../../../components/Modal/Modal";
import styles from "./Informations.module.scss";
import { UserContext } from "../../../context/UserContext";
import app from "../../../firebase";
import toast from "react-hot-toast";

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

export default function Informations() {
  const { user, updateLocalUser } = useContext(UserContext);
  const [feedback, setFeedback] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [img, setImg] = useState(null);
  const [imgURL, setImgURL] = useState("");
  const [imgProgress, setImgProgress] = useState(0);

  useEffect(() => {
    img && uploadFile(img);
  }, [img]);

  const schema = yup.object({
    oldPassword: yup.string().required("L'ancien mot de passe est obligatoire"),
    password: yup
      .string()
      .required("Le mot de passe est obligatoire")
      .min(5, "trop court"),
    confirmPassword: yup
      .string()
      .required("Vous devez confirmer votre mot de passe")
      .oneOf([yup.ref("password"), ""], "Les mots ne correspondent pas"),
  });

  const defaultValues = {
    oldPassword: "",
    password: "",
    confirmPassword: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues,
    mode: "onChange",
    resolver: yupResolver(schema),
  });

  function handleCloseModal() {
    setShowModal(false);
  }

  const uploadFile = (file) => {
    console.log(file);
    const storage = getStorage(app);
    const filename = new Date().getTime() + "_" + file.name;
    const storageRef = ref(storage, "images/" + filename);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        console.log(snapshot);
        setImgProgress(
          Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        );
      },
      (err) => {
        switch (err.code) {
          case "storage/unauthorized":
            console.error("Accès non autorisé");
            break;
          default:
            console.error(err);
        }
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImgURL(downloadURL.toString());
          console.log(downloadURL.toString());
          user.avatar = downloadURL.toString();
          toast.success("Avatar changed.");
          upUser();
        });
      }
    );
  };

  const upUser = async () => {
    const response = await updateUser(user);
    updateLocalUser(user);
  };

  return (
    <div className={`d-flex flex-fill flex-column ${styles.page}`}>
      <h2>My personal informations</h2>
      <div className={`${styles.img_container} mb-10`} id="avatar">
        <div
          className={`${styles.img}`}
          id="avatar"
          style={{ backgroundImage: `url(${user.avatar})` }}
        ></div>
        {/* <img src={user.avatar} alt="" className={`${styles.img}`} id="avatar" /> */}
        <div className={`${styles.edit_container}`}>
          <div className={`${styles.edit}`}>
            <i className={`fa-solid fa-pen ${styles.pointer}`}></i>
            <input
              type="file"
              name="img"
              id="img"
              accept="image/*"
              onChange={(e) => setImg(() => e.target.files[0])}
              className={`${styles.modify}`}
            />
          </div>
        </div>
      </div>

      <p>
        <strong>My username :</strong> {user.username}
      </p>
    </div>
  );
}
