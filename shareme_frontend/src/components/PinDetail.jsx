import React, {useEffect, useState } from 'react';
import { MdDownloadForOffline, MdOutlineShare, MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Client, urlFor } from '../client';
import MasonryLayout from './MasonryLayout';
import { pinDetailMorePinQuery, pinDetailQuery } from '../utils/data';
import Spinner from './Spinner';

// Importing toastify module
import {toast} from 'react-toastify';

// Import toastify css file
import 'react-toastify/dist/ReactToastify.css';

//  toast-configuration method,
// it is compulsory method.
toast.configure()

const PinDetail = ({user}) => {
    const { pinId } = useParams();
    const [pins, setPins] = useState(null);
    const [pinDetail, setPinDetail] = useState(null);
    const [comment, setComment] = useState('');
    const [addingComment, setAddingComment] = useState(false);
    const navigate = useNavigate();
    const [likingPost, setLikingPost] = useState(false)
    const alreadyLiked = !!(pinDetail?.like?.filter((item) => item?.postedBy?._id === user?._id))?.length;
    console.log(user?._id)
    const likePin = (id) => {
        if(!alreadyLiked){
            setLikingPost(true);
            toast(<div style={{color:'orange',fontWeight:'800'}} >
            Pin Liked!
            </div>);
            Client
            .patch(id)
            .setIfMissing({ like: [] })
            .insert('after', 'like[-1]', [{
            _key: uuidv4(),
            userId: user?._id,
            postedBy: {
                _type: 'postedBy',
                _ref: user?._id,
            },
            }])
            .commit()
            .then(() => {
                setLikingPost(false);
                let samepage = window.location.pathname;
                // navigate(`/`);
                navigate(samepage);
            });
        }
    };

    const fetchPinDetails = () =>{
        const query = pinDetailQuery(pinId);
        if(query){
            Client.fetch(`${query}`).then((data)=>{
                setPinDetail(data[0]);
                // console.log(data);
                // console.log(data[0].comments);
                if(data[0]){
                    const query1 = pinDetailMorePinQuery(data[0]);
                    Client.fetch(query1).then((res)=>{
                        setPins(res);
                    });
                }
            });
        }
    };

    const addComment = () => {
        if (comment) {
            setAddingComment(true);
            Client
                .patch(pinId)
                .setIfMissing({ comments: [] })
                .insert('after', 'comments[-1]', [{ comment, _key: uuidv4(), postedBy: { _type: 'postedBy', _ref: user._id } }])
                .commit()
                .then(() => {
                fetchPinDetails();
                setComment('');
                setAddingComment(false);
                toast(<div style={{color:'orange',fontWeight:'800'}} >
                    Comment Posted!<br></br> 
                    <span style={{color:'grey',fontSize:'10px',fontWeight:'500'}} >Visible after verification</span> 
                    </div>);
            });
        }
        };

        useEffect(() => {
            fetchPinDetails();
        }, [pinId]);
    

    if(!pinDetail){
        return (
            <Spinner message="Loding Pin..."/>
        );
    }

    const copytoClipboard = () => {
        toast(<div style={{color:'orange',fontWeight:'800'}} >
        Copy to Clipboard<br></br> 
        <span style={{color:'grey',fontSize:'10px',fontWeight:'500'}} >Share Link with friends</span> 
        </div>);
        var dummy = document.createElement('input'),text = window.location.href;
        document.body.appendChild(dummy);
        dummy.value = text;
        dummy.select();
        // console.log(text);
        document.execCommand('copy');
        document.body.removeChild(dummy);
    }

    return (
        <>
        <div className="flex xl:flex-row flex-col m-auto bg-white" style={{ maxWidth: '1500px', borderRadius: '32px' }}>
            <div className="flex justify-center items-center md:items-start flex-initial">
                <img 
                className="rounded-t-3xl rounded-b-lg"
                src={(pinDetail?.image && urlFor(pinDetail.image).url())} 
                alt="user-post"
                />
            </div>
            <div className="w-full p-5 flex-1 xl:min-w-620">
                <div className="flex items-center justify-between">
                    <div className="flex gap-2 items-center">
                    <a
                        href={`${pinDetail.image.asset.url}?dl=`}
                        download
                        className="bg-secondaryColor p-2 text-xl rounded-full flex items-center justify-center text-dark opacity-75 hover:opacity-100"
                        >
                        <MdDownloadForOffline fontSize={30} />
                    </a>
                    <div 
                    className="bg-secondaryColor p-2 text-xl rounded-full flex items-center justify-center text-dark opacity-75 hover:opacity-100"
                    >
                        <MdOutlineShare onClick={copytoClipboard} fontSize={30} />
                    </div>
                    {alreadyLiked ? (
                                <button
                                type="button"
                                onClick={(e)=>{
                                    e.stopPropagation();
                                    // deleteSavedPin(_id,save[0]._key);
                                    // console.log(save[0]._key);
                                }}
                                className="flex items-center justify-center text-red opacity-70 hover:opacity-100 font-bold px-3 py-1 text-base rounded-3xl hover:shadow-md outlined-none"
                                >
                                    <MdFavorite display={'flex'} color={'red'} fontSize={30} style={{marginRight:'4px'}} /> {pinDetail?.like?.length}
                                </button>
                            ):(
                                <button
                                type="button"
                                onClick={(e)=>{
                                    e.stopPropagation();
                                    likePin(pinId);
                                }}
                                className="flex items-center justify-center opacity-70 hover:opacity-100 text-red font-bold px-3 py-1 text-base rounded-3xl hover:shadow-md outlined-none"
                                >
                                    {likingPost ? <MdFavorite display={'flex'} color={'red'} fontSize={30} style={{marginRight:'4px'}}/> : <MdFavoriteBorder display={'flex'} color={'red'} fontSize={30} style={{marginRight:'4px'}}/> } {pinDetail?.like?.length > 0 ? pinDetail?.like.length : ''} 
                                </button>
                            )}
                    </div>
                    <a href={pinDetail.destination} target="_blank" rel="noreferrer">
                        {pinDetail.destination?.slice(8)}
                    </a>
                </div>
                <div>
                    <h1 className="text-4xl font-bold break-words mt-3">
                        {pinDetail.title}
                    </h1>
                    <p className="mt-3">{pinDetail.about}</p>
                </div>
                <Link to={`/user-profile/${pinDetail?.postedBy._id}`} className="flex gap-2 mt-5 items-center bg-white rounded-lg ">
                    <img src={pinDetail?.postedBy.image} className="w-10 h-10 rounded-full" alt="user-profile" />
                    <p className="font-bold">{pinDetail?.postedBy.userName}</p>
                </Link>
                <div className="mt-1 border-solid border-2 border-gray-100 p-1 rounded-md">
                <h2 className="mt-1 text-2xl">Comments</h2>
                <div className="max-h-370 overflow-y-auto">
                    {pinDetail?.comments?.map((item) =>(
                        <div className="flex gap-2 mt-5 items-center bg-white rounded-lg" key={item?._key}>
                            <img 
                            src={item.postedBy?.image} 
                            alt="user-profile"
                            className="w-10 h-10 rounded-full cursor-pointer"
                            />
                            <div className="flex flex-col">
                                <p className="font-bold">{item.postedBy?.userName}</p>
                                <p>{item.comment}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex flex-wrap mt-6 gap-3">
                <Link to={`/user-profile/${user._id}`}>
                    <img src={user.image} className="w-10 h-10 rounded-full cursor-pointer" alt="user-profile" />
                </Link>
                <input 
                className=" flex-1 border-gray-100 outline-none border-2 p-2 rounded-2xl focus:border-gray-300"
                type="text"
                placeholder="Add a Comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                />
                <button
                    type="button"
                    className="bg-red-500 text-white rounded-full px-6 py-2 font-semibold text-base outline-none"
                    onClick={addComment}
                >
                    {addingComment ? 'Doing...' : 'Done'}
                </button>
                </div>
                </div>
            </div>
        </div>
            {pins?.length > 0 && (
                <h2 className="text-center font-bold text-2xl mt-8 mb-4">
                More like this
                </h2>
            )}
            {pins ? (
                <MasonryLayout pins={pins} />
            ) : (
                <Spinner message="Loading more pins" />
            )}
            </>
    )}

export default PinDetail
