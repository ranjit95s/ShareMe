import React, { useEffect, useState } from 'react';
import { AiOutlineLogout } from 'react-icons/ai';
import { useParams, useNavigate } from 'react-router-dom';
import { GoogleLogout } from 'react-google-login';
import { userCreatedPinsQuery, userQuery, userSavedPinsQuery } from '../utils/data';
import {Client} from '../client';
import MasonryLayout from './MasonryLayout';
import Spinner from './Spinner';
require('dotenv').config()
const activeBtnStyles = 'bg-red-500 text-white font-bold p-2 rounded-full w-20 outline-none';
const notActiveBtnStyles = 'bg-primary mr-4 text-black font-bold p-2 rounded-full w-20 outline-none';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [pins, setPins] = useState(null);
    const [text, setText] = useState('Created');
    const [activeBtn, setActiveBtn] = useState('created');
    const navigate = useNavigate();
    const {userId} = useParams();
    const User = localStorage.getItem('user') !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : localStorage.clear();
    
    useEffect(() => {
        const query = userQuery(userId);
        Client.fetch(query).then((data)=>{
            setUser(data[0]);
        });
    }, [userId]);

    useEffect(() => {
        if(text === 'Created'){
            const createdPinsQuery = userCreatedPinsQuery(userId);
            Client.fetch(createdPinsQuery).then((data) => {
                setPins(data);
            });
        }else{
            const savedPinsQuery = userSavedPinsQuery(userId);
            Client.fetch(savedPinsQuery).then((data) => {
                setPins(data);
            });
        }
    }, [text,userId])

    const logout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (!user) return <Spinner message="Loading profile" />;
    return (
        <div className="relative pb-2 h-full justify-center items-center">
            <div className="flex flex-col pb-7">
                <div className="relative flex flex-col mb-7">
                    <div className="flex flex-col justify-center items-center">
                    <img
                    style={{height: '232px' }}
                    className="w-full h-600 2xl:h-310 shadow-lg object-cover"
                    src="https://source.unsplash.com/1600x900/?nature,technology"
                    alt="user-pic"
                    />
                    <img
                    className="rounded-full w-40 h-40 -mt-20 drop-shadow-lg object-cover" 
                    src={user.image} 
                    referrerPolicy="no-referrer"
                    alt="user-pic"
                    />
                    <h1 className="font-bold text-3xl text-center mt-3"> {user.userName} </h1>
                    <div className="absolute top-0 z-1 right-0 p-2">
                        {userId === User.googleId && (
                            <GoogleLogout
                            clientId={process.env.REACT_APP_GOOGLE_API_TOKEN}
                            render={(renderProps) => (
                                <button
                                    type="button"
                                    className="bg-white p-2 rounded-full cursor-pointer outline-none shadow-md"
                                    onClick={renderProps.onClick}
                                    disabled={renderProps.disabled}
                                >
                                    <AiOutlineLogout color="red" fontSize={21} />
                                </button>
                            )}
                            onLogoutSuccess={logout}
                            cookiePolicy="single_host_origin"
                        />
                        )}
                    </div>
                    </div>
                    <div className="text-center mb-7 mt-5">
                        <button
                        type="button"
                        onClick={(e) =>{
                            setText(e.target.textContent);
                            setActiveBtn('created');
                        }}
                        className={`${activeBtn === 'created' ? activeBtnStyles : notActiveBtnStyles}`}
                        >
                            Created
                        </button>
                        <button
                        type="button"
                        onClick={(e) =>{
                            setText(e.target.textContent);
                            setActiveBtn('saved');
                        }}
                        className={`${activeBtn === 'saved' ? activeBtnStyles : notActiveBtnStyles}`}
                        >
                            Saved
                        </button>
                    </div>
                {pins?.length ? (
                <div className="px-2">
                    <MasonryLayout pins={pins} />
                </div>
                ):(
                <div className="flex justify-center font-bold items-center w-full text-1xl mt-2">
                    No Pins Found!
                </div>
                )}
                </div>
            </div>
        </div>
    )
}

export default UserProfile
