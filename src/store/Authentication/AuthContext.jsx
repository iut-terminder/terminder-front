import React, { useState, useEffect } from "react";

const AuthContext = React.createContext({
    access: '',
    refresh: '',
    accessExp: null,
    refreshExp: null,
    isLoggedIn: false,
    isStaff: false,
    fullname: '',
    login: (access, refresh) => {},
    logout: () => {}
});

const calculateRemainingTime = (expirationTime) => {
    return expirationTime - Date.now();
};

const decodeAccessToken = (token) => {
    if (!token) return null;
    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch (_) {
        return null;
    }
};


export const AuthContextProvider = (props) => {
    const initialAccess = localStorage.getItem('access') || null;
    const initialRefresh = localStorage.getItem('refresh') || null;
    const initialAccessExp = localStorage.getItem('accessExp')
        ? Number(localStorage.getItem('accessExp'))
        : null;

    const initialRefreshExp = localStorage.getItem('refreshExp')
        ? Number(localStorage.getItem('refreshExp'))
        : null;

    const [access, setAccess] = useState(initialAccess)
    const [refresh, setRefresh] = useState(initialRefresh)
    const [accessExp, setAccessExp] = useState(initialAccessExp);
    const [refreshExp, setRefreshExp] = useState(initialRefreshExp);

    const userIsLoggedIn = !!access; 
    const decodedAccess = decodeAccessToken(access);
    const isStaff = !!decodedAccess?.is_staff;
    const fullname = decodedAccess?.fullname || '';

    const refreshAccessToken = async () => {
        if (!refresh) {
            logoutHandler();
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refresh }),
            });

            if (!response.ok) throw new Error("Refresh failed");

            const data = await response.json();

            // decode new exp
            const payload = JSON.parse(atob(data.access.split(".")[1]));
            const newExp = payload.exp * 1000;
            // save new access + exp
            setAccess(data.access);
            setAccessExp(newExp);
            
            localStorage.setItem("access", data.access);
            localStorage.setItem('refresh', refresh);
            localStorage.setItem("accessExp", newExp);
            localStorage.setItem('refreshExp', refreshExp);

            // re-create timer
            const remaining = calculateRemainingTime(newExp);
            setTimeout(refreshAccessToken, remaining);

        } catch (_) {
            console.log("sth went wrong!");
            logoutHandler(); // refresh هم خراب شد → logout
        }
    };

    useEffect(() => {
        if (access && accessExp) {
            const remainingTime = calculateRemainingTime(accessExp);

            if (remainingTime <= 0) {
                logoutHandler();
                return;
            }

            const timer = setTimeout(refreshAccessToken, remainingTime);

            return () => clearTimeout(timer);
        }
    }, [access, accessExp]);


    const loginHandler = (access, refresh, accessExp, refreshExp) => {
        setAccess(access);
        setRefresh(refresh);
        setAccessExp(accessExp);
        setRefreshExp(refreshExp);

        localStorage.setItem('access', access);
        localStorage.setItem('refresh', refresh);
        localStorage.setItem('accessExp', accessExp);
        localStorage.setItem('refreshExp', refreshExp);

        const remainingTime = calculateRemainingTime(accessExp);

        if (remainingTime <= 0) {
            logoutHandler();
            return;
        }

        setTimeout(refreshAccessToken, remainingTime);
    }

    const logoutHandler = () => {
        setAccess(null);
        setRefresh(null);
        setAccessExp(null);
        setRefreshExp(null);

        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('accessExp');
        localStorage.removeItem('refreshExp');
    }

    const contextValue = {
        access: access,
        refresh: refresh,
        accessExp,
        refreshExp,
        isLoggedIn: userIsLoggedIn,
        isStaff,
        fullname,
        login: loginHandler,
        logout: logoutHandler
    }

    return (<AuthContext.Provider value={contextValue}>{props.children}</AuthContext.Provider>)
};

export default AuthContext