import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { MdDownloadForOffline } from 'react-icons/md';
import { AiTwotoneDelete } from 'react-icons/ai';
import { BsFillArrowUpRightCircleFill } from 'react-icons/bs';
import { Client, urlFor } from '../client';

// Importing toastify module
import {toast} from 'react-toastify';

// Import toastify css file
import 'react-toastify/dist/ReactToastify.css';

 // toast-configuration method,
 // it is compulsory method.
toast.configure()


const Pin = ({ pin }) => {
    const { postedBy, image, _id, destination, save } = pin;

    const [postHovered, setPostHovered] = useState(false)
    const [savingPost, setSavingPost] = useState(false)
    const navigate = useNavigate();



    const user = localStorage.getItem('user') !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : localStorage.clear();
    const alreadySaved = !!(pin?.save?.filter((item) => item?.postedBy?._id === user?.googleId))?.length;
    
    // 1(user) , [2,3,1](saved) -> [1].length -> 1 -> !1 -> false -> !false -> true
    // 4(user) , [2,3,1](saved) -> [].length -> 0 -> 0! -> true -> !true -> false

        const savePin = (id) => {
            if(!alreadySaved){
                setSavingPost(true);
                toast(<div style={{color:'orange',fontWeight:'800'}} >
                Pin Saved!
                </div>);
                Client
                .patch(id)
                .setIfMissing({ save: [] })
                .insert('after', 'save[-1]', [{
                _key: uuidv4(),
                userId: user?.googleId,
                postedBy: {
                    _type: 'postedBy',
                    _ref: user?.googleId,
                },
                }])
                .commit()
                .then(() => {
                    setSavingPost(false);
                    let samepage = window.location.pathname;
                    navigate(`/`);
                    navigate(samepage);
                });
            }
        };

    const deletePin = (id) => {
            Client
                .delete(id)
                .then(() => {
                    toast(<div style={{color:'red',fontWeight:'800'}} >
                    Pin Deleting...<br></br> 
                    <span style={{color:'grey',fontSize:'10px',fontWeight:'500'}} >Take Few Minute to reflect</span> 
                    </div>);
                    let samepage = window.location.pathname;
                    navigate(`/`);
                    navigate(samepage);
                });
    }

    const deleteSavedPin = (id,saveId) => {
        const savedPin = ['save[0]',`save[_key == "${saveId}"]`];
        Client
            .patch(id)
            .unset(savedPin)
            .commit()
            .then(() => {
                toast(<div style={{color:'red',fontWeight:'800'}} >
                Pin Unsaving...<br></br> 
                <span style={{color:'grey',fontSize:'10px',fontWeight:'500'}} >Take Few Minute to reflect</span> 
                </div>);
                let samepage = window.location.pathname;
                navigate(`/pin-detail/${_id}`);
                navigate(samepage);
            })
    }

    return (
        <div className="m-2">
            <div
                onMouseEnter={() => setPostHovered(true)}
                onMouseLeave={() => setPostHovered(false)}
                onClick={() => navigate(`/pin-detail/${_id}`)}
                className="relative cursor-zoom-in w-auto hover:shadow-lg rounded-lg overflow-hidden transition-all duration-500 ease-in-out"
            >
                {image && (
                    <img className="rounded-lg w-full" src={(urlFor(image).width(250).url())} alt="user-post" />
                )}
                {postHovered && (
                    <div
                        className="absolute top-0 w-full h-full flex flex-col justify-between p-1 pr-2 pb-2 z-50"
                        style={{ height: '100%' }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                <a 
                                    href={`${image?.asset?.url}?dl=`}
                                    download
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toast(<div style={{color:'red',fontWeight:'800'}} >
                                        Pin Downloading...<br></br> 
                                        <span style={{color:'grey',fontSize:'10px',fontWeight:'500'}} >Share With Friends</span> 
                                        </div>);
                                    }}
                                className="bg-white w-9 h-9 rounded-full flex items-center justify-center text-dark text-xl opacity-75 hover:opacity-100 hover:shadow-md outline-none"
                                >
                                    <MdDownloadForOffline/>
                                </a>
                            </div>
                            {alreadySaved ? (
                                <button
                                type="button"
                                onClick={(e)=>{
                                    e.stopPropagation();
                                    deleteSavedPin(_id,save[0]._key);
                                    console.log(save[0]._key);
                                }}
                                className="bg-red-500 opacity-70 hover:opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl hover:shadow-md outlined-none"
                                >
                                    {pin?.save?.length} Saved
                                </button>
                            ):(
                                <button
                                type="button"
                                onClick={(e)=>{
                                    e.stopPropagation();
                                    savePin(_id);
                                }}
                                className="bg-red-500 opacity-70 hover:opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl hover:shadow-md outlined-none"
                                >
                                    {pin?.save?.length > 0 ? pin?.save.length : ''} {savingPost ? 'Saving' : 'Save'}
                                </button>
                            )}
                        </div>
                        <div className="flex justify-between items-center gap-2 w-full">
                                {destination && (
                                    <a href={destination}
                                    target="_blank"
                                    className="bg-white flex items-center gap-2 text-black font-bold p-2 pl-4 pr-4 rounded-full opacity-70 hover:opacity-100 hover:shadow-md"
                                    rel="noreferrer"
                                    >
                                        <BsFillArrowUpRightCircleFill />
                                        {destination.length > 20 ? destination.slice(8,20) : destination.slice(8)}
                                    </a>
                                )}
                                {postedBy?._id === user.googleId && (
                                    <button type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deletePin(_id);
                                    }}
                                    className="bg-white p-2 rounded-full w-8 h-8 flex items-center justify-center text-dark opacity-75 hover:opacity-100 outline-none"
                                    >
                                        <AiTwotoneDelete />
                                    </button>
                                )}
                        </div>
                    </div>
                )}
            </div>
            <Link to={`/user-profile/${postedBy?._id}`} className="flex gap-2 mt-2 items-center">
            <img
                className="w-8 h-8 rounded-full object-cover"
                src={postedBy?.image}
                referrerPolicy="no-referrer"
                alt="user-profile"
            />
            <p className="font-semibold capitalize">{postedBy?.userName}</p>
        </Link>
        </div>
    );
};

export default Pin