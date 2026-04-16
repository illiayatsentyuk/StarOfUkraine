export default {
  header: {
    create_tournament: "Create Tournament"
  },
  navigation: {
    home: "Home",
    about: "About",
    back_to_list: "BACK TO LIST",
    tournaments: "Tournaments"
  },
  auth: {
    title: "Tournament Hub",
    login_subtitle: "Log in to your profile",
    signup_subtitle: "Create your personal profile",
    login: "Login",
    signup: "SignUp",
    login_description: "Quick login via social networks or email",
    signup_description: "Quick login or fill in your details",
    or_email: "or email",
    email: "Email *",
    password: "Password *",
    confirm_password: "Confirm Password *",
    personal_data: "Personal Data",
    full_name: "Full Name *",
    birth_date: "Birth Date",
    gender: "Gender",
    gender_select: "Select",
    gender_male: "Male",
    gender_female: "Female",
    terms_accept: "I accept the",
    terms_link: "Terms of Use",
    terms_consent: "and consent to data processing.",
    login_btn: "LOGIN",
    signup_btn: "REGISTER",
    no_account: "No account?",
    have_account: "Already have an account?",
    switch_to_signup: "Register",
    switch_to_login: "Login"
  },
  profile: {
    title: "My Profile",
    name: "Name",
    email: "Email",
    role: "Role",
    not_specified: "Not specified",
    empty_text: "User information unavailable. Please log in.",
    logout: "Log Out",
    roles: {
      user: "User",
      admin: "Administrator",
      jury: "Jury"
    }
  },
  welcome: {
    title: "Star Of Ukraine",
    subtitle: "The ultimate platform for organizing, managing, and hosting competitive tournaments with ease.",
    actions: {
      view_tournaments: "View Tournaments"
    },
    features: {
      discover: {
        title: "Discover Events",
        text: "Browse our curated list of active and upcoming tournaments. Find detailed event info and the perfect competition to showcase your skills."
      },
      host: {
        title: "Host Tournaments",
        text: "Create and manage your own events effortlessly. Customize tournament details, rules, and gather participants in just a few clicks."
      },
      form_teams: {
        title: "Form Teams",
        text: "Build and manage your own squads. Create custom teams and participate in team-based tournaments together with your friends."
      }
    }
  },
  tournaments: {
    listing_title: "UPCOMING TOURNAMENTS",
    no_tournaments: "No tournaments yet.",
    load_more: "LOAD MORE",
    loading: "LOADING...",
    status_registration_open: "REGISTRATION OPEN",
    status_draft: "DRAFT",
    status_open: "OPEN",
    details: {
      about: "ABOUT TOURNAMENT",
      stats: {
        rounds: "ROUNDS",
        team_size: "PLAYERS PER TEAM",
        max_teams: "MAX TEAMS"
      },
      dates: {
        title: "KEY DATES",
        reg_start: "REGISTRATION STARTS",
        reg_end: "REGISTRATION ENDS",
        start_date: "START DATE",
        current_status: "CURRENT STATUS"
      },
      admin: {
        title: "MATCH VERIFICATION (ADMIN)",
        dota_placeholder: "Enter Dota 2 Match ID (e.g. 7600000000)",
        find_btn: "Find",
        searching: "Searching...",
        winner: "Winner",
        duration: "Duration",
        match_not_found: "Match not found or API error",
        radiant_win: "Radiant Victory",
        dire_win: "Dire Victory",
        radiant: "Radiant",
        dire: "Dire"
      },
      delete_tournament: "Delete Tournament",
      not_found: "Tournament not found."
    },
    filters: {
      all: "All",
      byDate: "By Date",
      byName: "By Name",
      byMaxTeams: "Teams Count",
      byTeamSizeMin: "Min. Size",
      byTeamSizeMax: "Max. Size",
      byRounds: "Rounds",
      byRegistrationStart: "Reg. Start",
      byRegistrationEnd: "Reg. End"
    }
  },
  modals: {
    create: {
      title: "Create Tournament",
      name_label: "Tournament Name",
      name_placeholder: "Enter tournament name",
      desc_label: "Description & Rules",
      desc_placeholder: "Enter description and rules",
      start_date: "Tournament Start Date",
      reg_start: "Registration Start",
      reg_end: "Registration End",
      rounds_label: "Number of Rounds",
      rounds_placeholder: "Rounds",
      max_teams_label: "Max Teams (Optional)",
      max_teams_placeholder: "Teams",
      min_players: "Min. Players",
      max_players: "Max. Players",
      min_placeholder: "Min.",
      max_placeholder: "Max.",
      hide_teams: "Hide teams until registration ends",
      creating: "Creating...",
      create_btn: "Create Tournament",
      error_creating: "An error occurred while creating the tournament."
    },
    delete: {
      title: "Delete Tournament",
      warning_prefix: "You are trying to delete tournament",
      warning_suffix: ". This action is irreversible!",
      confirmation_label: "To confirm, enter the tournament name FULLY IN UPPERCASE:",
      placeholder: "TOURNAMENT NAME",
      cancel: "CANCEL",
      delete_btn: "DELETE",
      deleting: "Deleting..."
    }
  },
  about_page: {
    title: "About Project",
    description: "Star Of Ukraine is a modern esports competition platform that unites players, organizers, and jury into a single ecosystem."
  },
  common: {
    language: "Language",
    english: "English",
    ukrainian: "Ukrainian",
    search_placeholder: "Search tournaments..."
  }
}
