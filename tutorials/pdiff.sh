#!/usr/bin/env bash
# templated from https://betterdev.blog/minimal-safe-bash-script-template/
# 1. Take a file as command line argument
# 2. Run prettier and display the diff
# 3. Ask for confirmation of running --write

# one of these 2 lines causes script to exit after diff command
#set -Eeuo pipefail
#trap cleanup SIGINT SIGTERM ERR EXIT

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd -P)
tmpfile=$(mktemp /tmp/pdiff-script.XXXXXXXXXX)

cleanup() {
  trap - SIGINT SIGTERM ERR EXIT
  # script cleanup here
  rm "${tmpfile}"
  exit
}

usage() {
  cat <<EOF
Usage: $(basename "${BASH_SOURCE[0]}") [-h] [-v] [-f] -p param_value arg1 [arg2...]

Run prettier on a file, display diff and write if user agrees.

Available options:

-h, --help      Print this help and exit
-v, --verbose   Print script debug info
-f, --file      File to pretty
EOF
  exit
}

setup_colors() {
  if [[ -t 2 ]] && [[ -z "${NO_COLOR-}" ]] && [[ "${TERM-}" != "dumb" ]]; then
    NOFORMAT='\033[0m' RED='\033[0;31m' GREEN='\033[0;32m' ORANGE='\033[0;33m' BLUE='\033[0;34m' PURPLE='\033[0;35m' CYAN='\033[0;36m' YELLOW='\033[1;33m'
  else
    NOFORMAT='' RED='' GREEN='' ORANGE='' BLUE='' PURPLE='' CYAN='' YELLOW=''
  fi
}

msg() {
  echo >&2 -e "${1-}"
}

die() {
  local msg=$1
  local code=${2-1} # default exit status 1
  msg "$msg"
  exit "$code"
}

parse_params() {
  # default values of variables set from params
  file=''

  while :; do
    case "${1-}" in
    -h | --help) usage ;;
    -v | --verbose) set -x ;;
    --no-color) NO_COLOR=1 ;;
    -f | --file) # example named parameter
      file="${2-}"
      shift
      ;;
    -?*) die "Unknown option: $1" ;;
    *) break ;;
    esac
    shift
  done

  args=("$@")

  # check required params and arguments
  [[ -z "${file-}" ]] && die "Missing required parameter: file"
  # no arguments to this script
  #[[ ${#args[@]} -eq 0 ]] && die "Missing script arguments"

  return 0
}

parse_params "$@"
setup_colors

# script logic here
#echo ${file}
npx prettier "${file}" > "${tmpfile}"

colordiff -a "${file}" "${tmpfile}"

msg "${YELLOW}Shall we go ahead and write the output of prettier to the file?${NOFORMAT}"
DEFAULT="y"
read -e -p "Proceed [Y/n/q]:" PROCEED
# adopt the default, if 'enter' given
PROCEED="${PROCEED:-${DEFAULT}}"
# change to lower case to simplify following if
PROCEED="${PROCEED,,}"
# condition for specific letter
if [ "${PROCEED}" == "q" ] ; then
  msg "${RED}Quitting${RED}"
  cleanup # and exit
# condition for non specific letter (ie anything other than q/y)
# if you want to have the active 'y' code in the last section
elif [ "${PROCEED}" != "y" ] ; then
  msg "Not writing to file"
else
  msg "${YELLOW}Writing the output of prettier to file.${NOFORMAT}"
  # do proceeding code in here
  npx prettier --write "${file}"
fi
msg "Done ... "
npx prettier --check "${file}"

cleanup # and exit

#msg "${RED}Read parameters:${NOFORMAT}"
#msg "- file: ${file}"
#msg "- arguments: ${args[*]-}"
